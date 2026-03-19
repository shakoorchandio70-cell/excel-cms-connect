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

    const { data: allItems } = await supabase.from("inventory").select("*");
    const lowStockItems = (allItems || []).filter(
      (i: any) => Number(i.current_stock) <= Number(i.min_level)
    );

    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    let smsBody: string;
    if (lowStockItems.length === 0) {
      smsBody = `CATI E&M Daily Stock Report — ${today}\nAll inventory items are adequately stocked. No action required.\n— CATI E&M CMS`;
    } else {
      const itemList = lowStockItems
        .map((i: any, idx: number) => `${idx + 1}. ${i.item_name} — ${i.current_stock} remaining (min: ${i.min_level})`)
        .join("\n");
      smsBody = `CATI E&M Daily Stock Report — ${today}\n\nLow stock items requiring procurement:\n${itemList}\n\nTotal items below minimum: ${lowStockItems.length}\n— CATI E&M CMS`;
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    let smsSent = false;
    if (adminRoles) {
      for (const role of adminRoles) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("mobile_number")
          .eq("user_id", role.user_id)
          .single();

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
              await resp.text();
              smsSent = resp.ok;
            } catch (e) {
              console.error("Twilio SMS failed:", e);
            }
          } else {
            console.log("Twilio not configured. Daily summary:", smsBody);
          }
          break;
        }
      }
    }

    await supabase.from("stock_alerts").insert({
      alert_type: "daily",
      stock_at_alert: lowStockItems.length,
      min_level: 0,
      sms_sent: smsSent,
      sent_at: smsSent ? new Date().toISOString() : null,
    });

    return new Response(JSON.stringify({ success: true, low_stock_count: lowStockItems.length, sms_sent: smsSent }), {
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
