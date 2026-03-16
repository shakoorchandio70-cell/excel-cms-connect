import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USERS = [
  // ADMINISTRATORS
  { email: "admin.em@cati.local", password: "em2026@", name: "Mr. Mohamed Amir", role: "admin", trade: null, location: "E&M Section", is_assignable: false, is_excluded: true },
  { email: "superadmin@cati.local", password: "em2026@", name: "CMS Administrator", role: "admin", trade: null, location: null, is_assignable: false, is_excluded: false },

  // TECHNICIANS - ASSIGNABLE
  { email: "tech.rehan@cati.local", password: "Aa123@", name: "Mr. Rehan", role: "user", trade: "HVAC/Mechanical", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.muzzafar@cati.local", password: "Aa123@", name: "Mr. Muzzafar", role: "user", trade: "Both (E&M + HVAC)", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.kasif@cati.local", password: "Aa123@", name: "Mr. Muhammad Kasif", role: "user", trade: "Electrical", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.gulam@cati.local", password: "Aa123@", name: "Mr. Gulam Ullah", role: "user", trade: "Electrical", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.shakil@cati.local", password: "Aa123@", name: "Mr. Shakil Ahmad", role: "user", trade: "Electrical", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.khursheed@cati.local", password: "Aa123@", name: "Mr. Khursheed Ahmad Naqvi", role: "user", trade: "HVAC/Mechanical", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.salman@cati.local", password: "Aa123@", name: "Mr. Salman", role: "user", trade: "Helper (Both)", location: "E&M Section", is_assignable: true, is_excluded: false },
  { email: "tech.younis@cati.local", password: "Aa123@", name: "M. Younis", role: "user", trade: "Helper (Both)", location: "E&M Section", is_assignable: true, is_excluded: false },

  // EXCLUDED PERSONNEL
  { email: "excluded.shafiq@cati.local", password: "Aa123@", name: "Mr. Shafiq Ahmad", role: "user", trade: "Electrical", location: "E&M Section", is_assignable: false, is_excluded: true },
  { email: "excluded.atif@cati.local", password: "Aa123@", name: "Mr. Mohamed Atif", role: "user", trade: null, location: "E&M Section", is_assignable: false, is_excluded: true },
  { email: "excluded.rabia@cati.local", password: "Aa123@", name: "Ms. Rabia", role: "user", trade: null, location: "E&M Section", is_assignable: false, is_excluded: true },
  { email: "excluded.amir@cati.local", password: "em2026@", name: "Mr. Mohamed Amir", role: "user", trade: null, location: "E&M Section", is_assignable: false, is_excluded: true },

  // SCHOOL OFFICIALS
  { email: "ans.ats@cati.local", password: "Aa123@", name: "ANS ATS Block Official", role: "user", trade: null, location: "ANS - ATS Block", is_assignable: false, is_excluded: false },
  { email: "ans.atsep@cati.local", password: "Aa123@", name: "ANS ATSEP Block Official", role: "user", trade: null, location: "ANS - ATSEP Block", is_assignable: false, is_excluded: false },
  { email: "aps.es@cati.local", password: "Aa123@", name: "APS ES Block Official", role: "user", trade: null, location: "APS - ES Block", is_assignable: false, is_excluded: false },
  { email: "aps.rffs@cati.local", password: "Aa123@", name: "APS RFFS Block Official", role: "user", trade: null, location: "APS - RFFS Block", is_assignable: false, is_excluded: false },
  { email: "regulatory@cati.local", password: "Aa123@", name: "Regulatory School Official", role: "user", trade: null, location: "Regulatory School", is_assignable: false, is_excluded: false },
  { email: "aviation@cati.local", password: "Aa123@", name: "Aviation Management School Official", role: "user", trade: null, location: "Aviation Management School", is_assignable: false, is_excluded: false },

  // SUPPORT SECTION OFFICIALS
  { email: "camp.cdt@cati.local", password: "Aa123@", name: "Camp Commandant Office", role: "user", trade: null, location: "Camp Commandant", is_assignable: false, is_excluded: false },
  { email: "security@cati.local", password: "Aa123@", name: "Security Section", role: "user", trade: null, location: "Security", is_assignable: false, is_excluded: false },
  { email: "sqms@cati.local", password: "Aa123@", name: "SQMS", role: "user", trade: null, location: "SQMS", is_assignable: false, is_excluded: false },
  { email: "logistics@cati.local", password: "Aa123@", name: "Logistics", role: "user", trade: null, location: "Logistics", is_assignable: false, is_excluded: false },
  { email: "finance@cati.local", password: "Aa123@", name: "Finance", role: "user", trade: null, location: "Finance", is_assignable: false, is_excluded: false },
  { email: "hr@cati.local", password: "Aa123@", name: "HR", role: "user", trade: null, location: "HR", is_assignable: false, is_excluded: false },
  { email: "civil.works@cati.local", password: "Aa123@", name: "Civil Works", role: "user", trade: null, location: "Civil Works", is_assignable: false, is_excluded: false },
  { email: "it@cati.local", password: "Aa123@", name: "Information Technology", role: "user", trade: null, location: "IT", is_assignable: false, is_excluded: false },
  { email: "motor.transport@cati.local", password: "Aa123@", name: "Motor Transport", role: "user", trade: null, location: "Motor Transport", is_assignable: false, is_excluded: false },
  { email: "medical@cati.local", password: "Aa123@", name: "Medical Center", role: "user", trade: null, location: "Medical Center", is_assignable: false, is_excluded: false },
  { email: "sports@cati.local", password: "Aa123@", name: "Sports Section", role: "user", trade: null, location: "Sports", is_assignable: false, is_excluded: false },
  { email: "admin@cati.local", password: "Aa123@", name: "Admin", role: "user", trade: null, location: "Admin", is_assignable: false, is_excluded: false },
  { email: "academics@cati.local", password: "Aa123@", name: "Academics", role: "user", trade: null, location: "Academics", is_assignable: false, is_excluded: false },
  { email: "comms.elec@cati.local", password: "Aa123@", name: "Communication Electronics", role: "user", trade: null, location: "Communication Electronics", is_assignable: false, is_excluded: false },
  { email: "library@cati.local", password: "Aa123@", name: "Library", role: "user", trade: null, location: "Library", is_assignable: false, is_excluded: false },
  { email: "hyd.airport@cati.local", password: "Aa123@", name: "Hyderabad Airport", role: "user", trade: null, location: "Hyderabad Airport", is_assignable: false, is_excluded: false },
  { email: "residential@cati.local", password: "Aa123@", name: "Residential Area", role: "user", trade: null, location: "Residential Area", is_assignable: false, is_excluded: false },
  { email: "hostel.mess@cati.local", password: "Aa123@", name: "Hostel & Mess", role: "user", trade: null, location: "Hostel & Mess", is_assignable: false, is_excluded: false },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of USERS) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.name },
        });

        if (authError) {
          // User might already exist
          if (authError.message?.includes("already been registered")) {
            results.push({ email: user.email, status: "already_exists" });
            continue;
          }
          results.push({ email: user.email, status: "error", error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Update profile with extra fields
        await supabase.from("profiles").update({
          trade: user.trade,
          location: user.location,
          is_assignable: user.is_assignable,
          is_excluded: user.is_excluded,
        }).eq("user_id", userId);

        // Set role if admin
        if (user.role === "admin") {
          await supabase.from("user_roles").upsert({
            user_id: userId,
            role: "admin",
          }, { onConflict: "user_id,role" });
        }

        results.push({ email: user.email, status: "created" });
      } catch (err) {
        results.push({ email: user.email, status: "error", error: String(err) });
      }
    }

    const created = results.filter(r => r.status === "created").length;
    const existing = results.filter(r => r.status === "already_exists").length;
    const errors = results.filter(r => r.status === "error").length;

    return new Response(
      JSON.stringify({ summary: { created, existing, errors, total: USERS.length }, details: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
