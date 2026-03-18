import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { item_id } = await req.json();

    // Get the item
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

    // Check if below min level
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

    // Get super admin mobile
    const { data: superAdminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    let smsSent = false;
    if (superAdminRoles) {
      for (const role of superAdminRoles) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("mobile_number, full_name")
          .eq("user_id", role.user_id)
          .single();

        if (profile?.mobile_number) {
          const smsBody = `CATI E&M Stock Alert:\n"${item.item_name}" has dropped below minimum level.\nCurrent stock: ${item.current_stock} ${item.unit} | Minimum: ${item.min_level} ${item.unit}\nPlease initiate procurement.\n— CATI E&M CMS`;

          // Try sending SMS via Twilio
          const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
          const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
          const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

          if (twilioSid && twilioToken && twilioPhone) {
            try {
              const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
              const resp = await fetch(twilioUrl, {
                method: "POST",
                headers: {
                  "Authorization": "Basic " + btoa(`${twilioSid}:${twilioToken}`),
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  To: profile.mobile_number,
                  From: twilioPhone,
                  Body: smsBody,
                }),
              });
              const respText = await resp.text();
              smsSent = resp.ok;
              if (!resp.ok) console.error("Twilio error:", respText);
            } catch (e) {
              console.error("Twilio SMS failed:", e);
            }
          } else {
            console.log("Twilio not configured. SMS content:", smsBody);
          }
          break; // Send to first admin with mobile
        }
      }
    }

    // Log alert
    await supabase.from("stock_alerts").insert({
      item_id,
      alert_type: "instant",
      stock_at_alert: item.current_stock,
      min_level: item.min_level,
      sms_sent: smsSent,
      sent_at: smsSent ? new Date().toISOString() : null,
    });

    return new Response(JSON.stringify({ alert: true, sms_sent: smsSent }), {
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
