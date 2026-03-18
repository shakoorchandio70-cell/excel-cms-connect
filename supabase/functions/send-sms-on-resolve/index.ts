import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { complaint_id } = await req.json();
    if (!complaint_id) {
      return new Response(JSON.stringify({ error: "complaint_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: complaint, error: cErr } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", complaint_id)
      .single();

    if (cErr || !complaint) {
      return new Response(JSON.stringify({ error: "Complaint not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!complaint.complainant_phone) {
      console.log("No contact number — skipping SMS");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "no_phone" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_PHONE_NUMBER) {
      console.log("Twilio not configured — logging SMS content:");
      console.log(
        `SMS to ${complaint.complainant_phone}: Dear ${complaint.complainant_name || "User"}, Your E&M complaint ${complaint.complaint_number} — "${complaint.title}" has been resolved. If the issue persists, log in to reopen your complaint. — CATI E&M Section`
      );

      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          reason: "twilio_not_configured",
          sms_content: `Dear ${complaint.complainant_name || "User"}, Your E&M complaint ${complaint.complaint_number} — "${complaint.title}" has been resolved.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsBody = `Dear ${complaint.complainant_name || "User"},\nYour E&M complaint ${complaint.complaint_number} — "${complaint.title}" has been resolved.\nIf the issue persists, log in to reopen your complaint.\n— CATI E&M Section`;

    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: complaint.complainant_phone,
        From: TWILIO_PHONE_NUMBER,
        Body: smsBody,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Twilio error:", result);
      // Don't break the flow
      return new Response(
        JSON.stringify({ success: true, sms_sent: false, twilio_error: result }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update complaint with sms_sent
    await supabase
      .from("complaints")
      .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
      .eq("id", complaint_id);

    return new Response(
      JSON.stringify({ success: true, sms_sent: true, sid: result.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: true, sms_sent: false, error: String(error) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
