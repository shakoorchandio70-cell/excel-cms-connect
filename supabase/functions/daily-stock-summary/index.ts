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

    // Get all low stock items
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

    // Get super admin mobile
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

    // Log alert
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
