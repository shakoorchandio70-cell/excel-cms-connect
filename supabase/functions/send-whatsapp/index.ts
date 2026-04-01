import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Phase 2 — WhatsApp Business API placeholder
// Activate when Meta verification is complete and credentials are added:
//   WHATSAPP_PHONE_NUMBER_ID
//   WHATSAPP_ACCESS_TOKEN
//   WHATSAPP_API_VERSION (default: v18.0)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message } = await req.json();

    const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const apiVersion = Deno.env.get("WHATSAPP_API_VERSION") || "v18.0";

    if (!phoneId || !token) {
      console.log("WhatsApp not configured — skipping. Message:", message);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "whatsapp_not_configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "to and message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to, // format: 923001234567
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) console.error("WhatsApp API error:", result);

    return new Response(JSON.stringify({ success: response.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
