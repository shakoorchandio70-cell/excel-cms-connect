import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

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

    // Get admin mobile
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
              const respData = await resp.json();
              smsSent = resp.ok;
              if (!resp.ok) console.error("Twilio gateway error:", respData);
            } catch (e) {
              console.error("Twilio SMS failed:", e);
            }
          } else {
            console.log("Twilio not configured. SMS content:", smsBody);
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
