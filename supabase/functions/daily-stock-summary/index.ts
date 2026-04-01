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

    const { data: allItems } = await supabase.from("inventory").select("*");
    const lowStockItems = (allItems || []).filter(
      (i: any) => Number(i.current_stock) <= Number(i.min_level)
    );

    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    // Build SMS body
    let smsBody: string;
    if (lowStockItems.length === 0) {
      smsBody = `CATI E&M Daily Stock Report — ${today}\nAll inventory items are adequately stocked. No action required.\n— CATI E&M CMS`;
    } else {
      const itemList = lowStockItems
        .map((i: any, idx: number) => `${idx + 1}. ${i.item_name} — ${i.current_stock} remaining (min: ${i.min_level})`)
        .join("\n");
      smsBody = `CATI E&M Daily Stock Report — ${today}\n\nLow stock items requiring procurement:\n${itemList}\n\nTotal items below minimum: ${lowStockItems.length}\n— CATI E&M CMS`;
    }

    // Build email HTML
    let emailHtml: string;
    if (lowStockItems.length === 0) {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e3c72; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #ffffff; margin: 0;">Daily Stock Report — ${today}</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">CATI E&M Daily Stock Summary — ${today}</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="color: #166534; margin: 0;">✅ All inventory items are adequately stocked. No action required today.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">— CATI E&M CMS</p>
          </div>
        </div>
      `;
    } else {
      const rows = lowStockItems
        .map((i: any, idx: number) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i.item_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${i.current_stock} ${i.unit}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i.min_level} ${i.unit}</td>
          </tr>
        `).join("");

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #ffffff; margin: 0;">Daily Stock Report — ${today}</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">CATI E&M Daily Stock Summary — ${today}</p>
            <p style="color: #333;">The following items require procurement:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f9fafb;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">#</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Current</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Minimum</th>
              </tr>
              ${rows}
            </table>
            <p style="color: #dc2626; font-weight: bold;">Total: ${lowStockItems.length} item(s) need attention.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">— CATI E&M CMS</p>
          </div>
        </div>
      `;
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    let smsSent = false;
    let emailSent = false;

    if (adminRoles) {
      for (const role of adminRoles) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("mobile_number, email, email_notifications")
          .eq("user_id", role.user_id)
          .single();

        // Send email
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY && profile?.email && (profile as any).email_notifications !== false) {
          try {
            const resp = await fetch(RESEND_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "CATI E&M CMS <onboarding@resend.dev>",
                to: [profile.email],
                subject: `Daily Stock Report — ${today}`,
                html: emailHtml,
              }),
            });
            emailSent = resp.ok;
            if (!resp.ok) console.error("Resend error:", await resp.text());
          } catch (e) {
            console.error("Email send failed:", e);
          }
        }

        // Send SMS (if Twilio configured)
        if (profile?.mobile_number) {
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

    await supabase.from("stock_alerts").insert({
      alert_type: "daily",
      stock_at_alert: lowStockItems.length,
      min_level: 0,
      sms_sent: smsSent || emailSent,
      sent_at: (smsSent || emailSent) ? new Date().toISOString() : null,
    });

    return new Response(JSON.stringify({ success: true, low_stock_count: lowStockItems.length, sms_sent: smsSent, email_sent: emailSent }), {
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
