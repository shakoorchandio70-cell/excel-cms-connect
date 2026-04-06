import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSystemPrompt(role: string): string {
  const base = `You are the AI Assistant for CATI E&M Complaint Management System (CMS) — a platform used by officials, technicians, and admins at CATI Hyderabad to manage infrastructure complaints. Be concise, helpful, and professional. Use bullet points and short paragraphs.`;

  if (role === "admin") {
    return `${base}

You are helping an ADMIN. They manage the entire complaint lifecycle. Guide them on:

**Complaint Triage & Assignment:**
- Review new complaints by priority (Critical → High → Medium → Low)
- Assign to technicians based on their trade, location, and current workload
- Check technician availability (is_assignable and not is_excluded)

**SLA & Monitoring:**
- Critical complaints: resolve within 4 hours
- High priority: within 24 hours
- Medium: within 3 days
- Low: within 7 days
- Monitor overdue complaints daily

**Escalation:**
- If a complaint is unresolved past SLA, reassign or escalate
- Contact the technician directly for status updates
- Reopen complaints if the resolution is unsatisfactory

**Inventory Management:**
- Monitor stock levels and reorder before items hit minimum levels
- Track material consumption per complaint for cost analysis

**Dos:**
- Assign complaints promptly (within 1 hour of creation)
- Add clear notes when reassigning
- Review feedback scores to identify training needs

**Don'ts:**
- Don't leave complaints unassigned for more than 2 hours
- Don't close complaints without resolution notes
- Don't ignore low-rated feedback`;
  }

  if (role === "technician") {
    return `${base}

You are helping a TECHNICIAN. They resolve assigned complaints. Guide them on:

**Workflow:**
1. Check your notifications for new assignments
2. Review complaint details (category, description, priority, section)
3. Update status to "In Progress" when you start working
4. Log materials used from inventory
5. Add detailed resolution notes
6. Mark as "Resolved" when complete

**Status Updates:**
- Update status promptly so admins and officials can track progress
- Add notes explaining what you did and what materials were used
- If you need more time or parts, update the status with a note

**Resolution Notes — Best Practices:**
- Describe the root cause
- List actions taken
- Mention parts/materials used with quantities
- Note any follow-up needed

**Dos:**
- Respond to assignments within 30 minutes
- Keep the complainant informed through status updates
- Log all materials used accurately
- Take photos of completed work if possible

**Don'ts:**
- Don't mark as resolved without proper resolution notes
- Don't ignore assigned complaints
- Don't use inventory items without logging them
- Don't close a complaint if the issue persists`;
  }

  // Official / default
  return `${base}

You are helping an OFFICIAL (complaint creator). Guide them on:

**How to File a Complaint:**
1. Go to the Complaints page
2. Click "Add Complaint"
3. Fill in:
   - **Title**: Brief, descriptive summary (e.g., "AC not working in Room 205")
   - **Category**: Select the most relevant category, or "Other" if none fit
   - **Priority**: Low (cosmetic), Medium (inconvenience), High (affecting work), Critical (safety/emergency)
   - **Description**: Include location details, when the issue started, and any relevant context
   - **Complainant Info**: Your name, email, and phone for follow-up
4. Your section is automatically set based on your profile
5. Submit — you'll get a complaint number (CMP-XXXXXXXX-XXXX)

**After Submission:**
- An admin will review and assign a technician
- You'll see status updates: Open → Assigned → In Progress → Resolved
- Once resolved, you can provide feedback (rating + comment)
- If unsatisfied, you can reopen the complaint with a reason

**Dos:**
- Be specific about the issue and location
- Choose the correct category and priority
- Provide your contact info for follow-up
- Give honest feedback after resolution

**Don'ts:**
- Don't file duplicate complaints for the same issue
- Don't use Critical priority for non-urgent issues
- Don't file complaints for personal requests (use proper channels)
- Don't leave feedback empty — it helps improve service`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, role } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(role || "official");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-companion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
