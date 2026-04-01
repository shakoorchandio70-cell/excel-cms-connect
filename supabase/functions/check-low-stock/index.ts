import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const RESEND_API_URL = "https://api.resend.com/emails";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { item_id } = await req.json();

    const { data: item, error: itemErr } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemErr || !item) {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (Number(item.current_stock) > Number(item.min_level)) {
      return new Response(JSON.stringify({ alert: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for duplicate alert within last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAlerts } = await supabase
      .from("stock_alerts")
      .select("id")
      .eq("item_id", item_id)
      .eq("alert_type", "instant")
      .gte("created_at", oneHourAgo);

    if (recentAlerts && recentAlerts.length > 0) {
      return new Response(JSON.stringify({ alert: false, reason: "Already alerted within 1 hour" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin profiles for notification
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    let smsSent = false;
    let emailSent = false;
    const deficit = Number(item.min_level) - Number(item.current_stock);

    if (adminRoles) {
      for (const role of adminRoles) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("mobile_number, full_name, email, email_notifications")
          .eq("user_id", role.user_id)
          .single();

        // Send email notification
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY && profile?.email && (profile as any).email_notifications !== false) {
          try {
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="color: #ffffff; margin: 0;">⚠️ Low Stock Alert</h2>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                  <p style="color: #333;">Stock Alert — CATI E&M Inventory</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 8px 0; color: #666; width: 140px;">Item:</td><td style="padding: 8px 0; font-weight: bold;">${item.item_name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Category:</td><td style="padding: 8px 0;">${item.category}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Current Stock:</td><td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${item.current_stock} ${item.unit}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Minimum Level:</td><td style="padding: 8px 0;">${item.min_level} ${item.unit}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Deficit:</td><td style="padding: 8px 0; color: #dc2626;">${deficit} ${item.unit}</td></tr>
                  </table>
                  <p style="color: #333; font-weight: bold;">Please initiate procurement immediately.</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                  <p style="color: #999; font-size: 12px;">— CATI E&M CMS</p>
                </div>
              </div>
            `;

            const resp = await fetch(RESEND_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "CATI E&M CMS <onboarding@resend.dev>",
                to: [profile.email],
                subject: `Low Stock Alert — ${item.item_name}`,
                html,
              }),
            });
            emailSent = resp.ok;
            if (!resp.ok) console.error("Resend error:", await resp.text());
          } catch (e) {
            console.error("Email send failed:", e);
          }
        }

        // Send SMS notification (if Twilio configured)
        if (profile?.mobile_number) {
          const smsBody = `CATI E&M Stock Alert:\n"${item.item_name}" has dropped below minimum level.\nCurrent stock: ${item.current_stock} ${item.unit} | Minimum: ${item.min_level} ${item.unit}\nPlease initiate procurement.\n— CATI E&M CMS`;

          const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
          const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
          const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

          if (LOVABLE_API_KEY && TWILIO_API_KEY && TWILIO_PHONE_NUMBER) {
            try {
              const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                  "X-Connection-Api-Key": TWILIO_API_KEY,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  To: profile.mobile_number,
                  From: TWILIO_PHONE_NUMBER,
                  Body: smsBody,
                }),
              });
              smsSent = resp.ok;
            } catch (e) {
              console.error("Twilio SMS failed:", e);
            }
          }
          break;
        }
      }
    }

    // Log alert
    await supabase.from("stock_alerts").insert({
      item_id,
      alert_type: "instant",
      stock_at_alert: item.current_stock,
      min_level: item.min_level,
      sms_sent: smsSent || emailSent,
      sent_at: (smsSent || emailSent) ? new Date().toISOString() : null,
    });

    return new Response(JSON.stringify({ alert: true, sms_sent: smsSent, email_sent: emailSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
