import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Lock, Zap, Activity, ShieldCheck, Package, Mail, BarChart3, Crown, ClipboardList, Wrench } from "lucide-react";
import { CatiLogo } from "@/components/BrandLogo";

const C = {
  greenDark: "#1A4731",
  greenMid: "#2D6A4F",
  greenLight: "#3D8C68",
  lime: "#76B041",
  limeBright: "#9CCC4A",
  cream: "#F5F6F0",
  white: "#FFFFFF",
  charcoal: "#1C1F1A",
  muted: "#5A6358",
  border: "#D4DCCE",
};

const SectionLabel = ({ children, center = false, dark = false }: { children: React.ReactNode; center?: boolean; dark?: boolean }) => (
  <div
    className="text-[11.5px] font-semibold uppercase mb-3 flex items-center gap-2.5"
    style={{ letterSpacing: "0.1em", color: C.lime, justifyContent: center ? "center" : undefined }}
  >
    {children}
    {!center && <span className="flex-1 h-px max-w-[60px]" style={{ background: dark ? "rgba(255,255,255,0.15)" : C.border }} />}
  </div>
);

const LandingPage = () => {
  return (
    <div style={{ background: C.cream, color: C.charcoal, fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12"
        style={{ height: 68, background: "rgba(26,71,49,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(118,176,65,0.2)" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <CatiLogo size={36} variant="light" />
          <div>
            <div className="text-white text-[15px] font-semibold tracking-wide">E&amp;M CMS</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>CATI · Hyderabad</div>
          </div>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#features" className="text-[13.5px] transition-colors" style={{ color: "rgba(255,255,255,0.72)" }} onMouseEnter={(e) => (e.currentTarget.style.color = C.limeBright)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")}>Features</a>
          <a href="#howitworks" className="text-[13.5px]" style={{ color: "rgba(255,255,255,0.72)" }} onMouseEnter={(e) => (e.currentTarget.style.color = C.limeBright)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")}>How it Works</a>
          <a href="#roles" className="text-[13.5px]" style={{ color: "rgba(255,255,255,0.72)" }} onMouseEnter={(e) => (e.currentTarget.style.color = C.limeBright)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")}>Access Roles</a>
          <Link to="/auth" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-[13.5px] transition-all" style={{ background: C.lime, color: C.greenDark }} onMouseEnter={(e) => (e.currentTarget.style.background = C.limeBright)} onMouseLeave={(e) => (e.currentTarget.style.background = C.lime)}>
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          minHeight: "100vh",
          padding: "120px 24px 80px",
          background: `radial-gradient(ellipse 70% 60% at 80% 40%, rgba(45,106,79,0.35) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 15% 70%, rgba(118,176,65,0.18) 0%, transparent 60%), ${C.greenDark}`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 520, height: 520, top: -120, right: -100, border: "1px solid rgba(118,176,65,0.12)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 320, height: 320, top: 60, right: 40, border: "1px solid rgba(118,176,65,0.08)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, top: 160, right: 170, border: "1px solid rgba(118,176,65,0.15)", background: "rgba(118,176,65,0.04)" }} />

        <div className="relative z-10 max-w-[620px] mx-auto lg:mx-0 lg:ml-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 uppercase text-[12px] font-medium" style={{ background: "rgba(118,176,65,0.15)", border: "1px solid rgba(118,176,65,0.35)", color: C.limeBright, letterSpacing: "0.04em" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.limeBright, animation: "lp-pulse 2s infinite" }} /> Pakistan Airports Authority · CATI Hyderabad
          </div>
          <h1 className="text-white mb-5" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            Electromechanical<br />
            <em className="not-italic" style={{ color: C.lime }}>Complaint Management</em><br />
            Reimagined
          </h1>
          <p className="mb-10 max-w-[500px]" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}>
            A unified digital platform for logging, tracking, and resolving E&amp;M complaints across CATI — replacing paper trails with real-time visibility.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-[10px] font-bold transition-all" style={{ background: C.lime, color: C.greenDark, padding: "15px 32px", fontSize: 15, boxShadow: "0 4px 20px rgba(118,176,65,0.35)" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.limeBright; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = C.lime; e.currentTarget.style.transform = "translateY(0)"; }}>
              Sign In to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-[10px] font-medium text-white transition-all" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", padding: "15px 28px", fontSize: 15 }}>
              See Features <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Mock dashboard */}
        <div className="hidden lg:block absolute z-10" style={{ right: 80, top: "50%", transform: "translateY(-50%)", width: 380, animation: "lp-floatCard 5s ease-in-out infinite" }}>
          <div className="rounded-[18px] p-6" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "#FF6B6B" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#FFD93D" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#6BCB77" }} />
              <span className="ml-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>Live Complaints · E&amp;M Section</span>
            </div>
            {[
              { label: "🔌 Generator Trip – B2", pill: "Open", style: { background: "rgba(255,193,7,0.15)", color: "#FFD93D" } },
              { label: "❄️ HVAC Fault – Terminal", pill: "In Progress", style: { background: "rgba(118,176,65,0.15)", color: C.limeBright } },
              { label: "💡 AGL Lamp Outage", pill: "In Progress", style: { background: "rgba(118,176,65,0.15)", color: C.limeBright } },
              { label: "🔧 UPS Battery Replace", pill: "Resolved", style: { background: "rgba(100,180,100,0.12)", color: "#7EC880" } },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>{r.label}</span>
                <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full" style={{ ...r.style, letterSpacing: "0.04em" }}>{r.pill}</span>
              </div>
            ))}
            <div className="flex gap-2.5 mt-4">
              {[{ n: "12", l: "Open" }, { n: "5", l: "In Progress" }, { n: "94%", l: "Resolved" }].map((s, i) => (
                <div key={i} className="flex-1 text-center rounded-[10px] py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ color: C.lime, fontSize: 22, fontWeight: 700, fontFamily: "'Lora', serif" }}>{s.n}</div>
                  <div className="mt-0.5" style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="flex flex-wrap justify-center" style={{ background: C.greenMid, padding: "36px 24px" }}>
        {[
          { n: "500+", l: "Complaints Logged" },
          { n: "<24h", l: "Avg. Response Time" },
          { n: "3", l: "Access Roles" },
          { n: "8+", l: "Trades Covered" },
          { n: "100%", l: "Digital — Paperless" },
        ].map((s, i, arr) => (
          <div key={i} className="flex-1 min-w-[160px] text-center px-8 py-5" style={{ borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 38, fontWeight: 700, color: C.lime, lineHeight: 1 }}>{s.n}</div>
            <div className="mt-1.5" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: C.white, padding: "96px 24px" }}>
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <SectionLabel center>Platform Capabilities</SectionLabel>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: C.greenDark, marginBottom: 16 }}>Everything Your E&amp;M Team Needs</h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7 }}>Built specifically for CATI's electromechanical operations — not a generic helpdesk, but a system that understands your trades and workflows.</p>
        </div>
        <div className="grid gap-6 max-w-[1100px] mx-auto" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {[
            { Icon: Zap, t: "Auto-Assignment by Trade", d: "Complaints are automatically routed to the correct technician based on their trade — Electrical, HVAC, Civil, Plumbing, and more. Zero manual dispatch." },
            { Icon: Activity, t: "Real-Time Status Tracking", d: "From submission to resolution, every complaint's journey is visible. Officials and admins get live dashboards; technicians see their queue instantly." },
            { Icon: ShieldCheck, t: "Role-Based Access Control", d: "Three-tier RBAC ensures Admins, Officials, and Technicians each see only what they need — secure, clean, purpose-built views." },
            { Icon: Package, t: "Inventory Management", d: "Track spare parts and consumables used per complaint. Link inventory draw-downs to specific tickets for full accountability." },
            { Icon: Mail, t: "Email Notifications", d: "Automated email alerts keep stakeholders informed at every stage — assignment, status change, and resolution — without manual follow-up." },
            { Icon: BarChart3, t: "Analytics & Reports", d: "Built-in reporting on complaint volume, resolution times, technician performance, and repeat-fault analysis — data that drives decisions." },
          ].map(({ Icon, t, d }, i) => (
            <div key={i} className="group rounded-2xl transition-all" style={{ padding: "32px 28px", border: `1px solid ${C.border}`, background: C.cream }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(45,106,79,0.1)"; e.currentTarget.style.borderColor = C.greenLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
              <div className="grid place-items-center mb-4" style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})` }}>
                <Icon className="h-5 w-5" style={{ color: C.limeBright }} />
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: C.greenDark, marginBottom: 10 }}>{t}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" style={{ background: C.cream, padding: "96px 24px" }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-16">
            <SectionLabel>Simple Process</SectionLabel>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: C.greenDark, marginBottom: 16 }}>Three Steps to Resolution</h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, maxWidth: 520 }}>From fault report to closure — a clear, auditable workflow every time.</p>
          </div>
          <div className="grid gap-8 relative" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div className="hidden md:block absolute" style={{ top: 36, left: "15%", right: "15%", height: 2, background: `linear-gradient(90deg, ${C.lime} 0%, ${C.greenLight} 100%)`, zIndex: 0 }} />
            {[
              { n: 1, t: "Official Logs Complaint", d: "An authorized official submits a complaint with location, fault description, and priority. The system captures timestamp and requester details automatically." },
              { n: 2, t: "System Assigns Technician", d: "Based on the trade category, the complaint is auto-assigned to the right technician. Both the technician and admin receive instant notifications." },
              { n: 3, t: "Resolve & Close", d: "The technician updates the job with work done, materials used, and marks it resolved. The official verifies and formally closes the ticket." },
            ].map((s) => (
              <div key={s.n} className="relative text-center rounded-2xl" style={{ padding: "32px 24px", background: C.white, border: `1px solid ${C.border}`, zIndex: 1 }}>
                <div className="grid place-items-center mx-auto mb-5" style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`, color: "white", fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }}>{s.n}</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 600, color: C.greenDark, marginBottom: 10 }}>{s.t}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" style={{ background: C.greenDark, padding: "96px 24px" }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-14">
            <SectionLabel dark>Access Control</SectionLabel>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: "white", marginBottom: 16 }}>Three Roles, One System</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 520 }}>Purpose-built views for every stakeholder — no clutter, no confusion.</p>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))" }}>
            {[
              { Icon: Crown, t: "Administrator", d: "Full system control — manage users, configure trades, view all complaints, and generate organizational reports.", perms: ["User management", "System configuration", "All complaints visibility", "Report generation", "Inventory oversight"] },
              { Icon: ClipboardList, t: "Official", d: "Department representatives who raise complaints, monitor their status, and verify resolution before final closure.", perms: ["Submit complaints", "Track complaint status", "Verify resolutions", "Department dashboard"] },
              { Icon: Wrench, t: "Technician", d: "Trade-specific technicians who receive assigned jobs, update progress, log materials used, and mark completion.", perms: ["View assigned jobs", "Update work progress", "Log materials used", "Mark job complete"] },
            ].map(({ Icon, t, d, perms }, i) => (
              <div key={i} className="rounded-2xl transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "32px 28px" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div className="grid place-items-center mb-4" style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(118,176,65,0.2)", border: "1px solid rgba(118,176,65,0.3)" }}>
                  <Icon className="h-6 w-6" style={{ color: C.limeBright }} />
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 19, fontWeight: 600, color: "white", marginBottom: 10 }}>{t}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 16 }}>{d}</div>
                <ul className="flex flex-col gap-1.5">
                  {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[12.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <span style={{ color: C.lime, fontWeight: 700 }}>✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.greenMid} 0%, ${C.greenDark} 100%)`, padding: "80px 24px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 50%, rgba(118,176,65,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(118,176,65,0.15) 0%, transparent 50%)" }} />
        <h2 className="relative" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, color: "white", marginBottom: 14 }}>Ready to Streamline E&amp;M Operations?</h2>
        <p className="relative" style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 36 }}>Sign in to your role-specific dashboard and manage complaints with clarity.</p>
        <Link to="/auth" className="relative inline-flex items-center gap-2 rounded-[10px] font-bold transition-all" style={{ background: C.lime, color: C.greenDark, padding: "15px 32px", fontSize: 15, boxShadow: "0 4px 20px rgba(118,176,65,0.35)" }}>
          Access Your Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 lg:px-12 py-10" style={{ background: "#0F2B1C" }}>
        <div className="flex items-center gap-3">
          <CatiLogo size={32} variant="light" />
          <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <strong style={{ color: "rgba(255,255,255,0.85)" }}>E&amp;M CMS</strong> · Civil Aviation Training Institute<br />
            Pakistan Airports Authority, Hyderabad
          </div>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>Features</a>
          <a href="#howitworks" className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>How it Works</a>
          <a href="#roles" className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>Roles</a>
          <Link to="/auth" className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>Sign In</Link>
        </div>
        <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>© 2025 PAA · CATI Hyderabad. Internal use only.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
