import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_URL = "https://api.resend.com/emails";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { complaint_id } = await req.json();
    if (!complaint_id) {
      return new Response(JSON.stringify({ error: "complaint_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: complaint } = await supabase.from("complaints").select("*").eq("id", complaint_id).single();
    if (!complaint) {
      return new Response(JSON.stringify({ error: "Complaint not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get complainant email from profiles (created_by)
    const { data: complainantProfile } = await supabase.from("profiles").select("*").eq("user_id", complaint.created_by).single();
    if (!complainantProfile?.email || !(complainantProfile as any).email_notifications) {
      console.log("Complainant has no email or notifications disabled — skipping");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get technician name
    let techName = "Technician";
    if (complaint.assigned_to) {
      const { data: techProfile } = await supabase.from("profiles").select("full_name").eq("user_id", complaint.assigned_to).single();
      if (techProfile?.full_name) techName = techProfile.full_name;
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured — skipping");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e3c72; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">Complaint Resolved</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="color: #333;">Dear ${complainantProfile.full_name || "User"},</p>
          <p style="color: #333;">Your E&M complaint has been resolved.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;">Complaint ID:</td><td style="padding: 8px 0; font-weight: bold;">${complaint.complaint_number}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Title:</td><td style="padding: 8px 0;">${complaint.title}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Resolved by:</td><td style="padding: 8px 0;">${techName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Resolved on:</td><td style="padding: 8px 0;">${date}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Notes:</td><td style="padding: 8px 0;">${complaint.resolution_notes || "N/A"}</td></tr>
          </table>
          <p style="color: #333;">If the issue persists, please log in to reopen your complaint.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">— CATI E&M Section</p>
        </div>
      </div>
    `;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CATI E&M CMS <onboarding@resend.dev>",
        to: [complainantProfile.email],
        subject: `Complaint Resolved — ${complaint.complaint_number}`,
        html,
      }),
    });

    const result = await response.json();
    if (!response.ok) console.error("Resend error:", result);

    return new Response(JSON.stringify({ success: response.ok, email_sent: response.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email on resolve failed:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
