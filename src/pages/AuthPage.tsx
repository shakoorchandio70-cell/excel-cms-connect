import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, Users, Zap } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Section */}
      <div className="relative lg:w-[60%] w-full min-h-[280px] lg:min-h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)" }}>
        
        {/* Abstract shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 right-[-80px] w-[300px] h-[300px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-60px] left-1/4 w-[250px] h-[250px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          
          {/* Glass cards floating */}
          <div className="absolute top-[15%] left-[10%] w-48 h-28 rounded-2xl rotate-[-8deg] opacity-[0.08] border border-white/20"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }} />
          <div className="absolute bottom-[20%] right-[12%] w-40 h-24 rounded-2xl rotate-[12deg] opacity-[0.08] border border-white/20"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 lg:px-16 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium tracking-wide"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
            <Zap className="h-4 w-4" />
            Enterprise-Grade Platform
          </div>

          <h1 className="text-3xl lg:text-[2.75rem] lg:leading-[1.15] font-bold tracking-tight mb-5"
            style={{ color: "white" }}>
            Smart Complaint Management for Modern Infrastructure
          </h1>
          <p className="text-base lg:text-lg mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}>
            Real-time tracking, automated workflows, and actionable insights — all in one platform.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 lg:gap-10 justify-center lg:justify-start">
            {[
              { icon: CheckCircle2, value: "2,400+", label: "Resolved" },
              { icon: Users, value: "45+", label: "Technicians" },
              { icon: Zap, value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)" }}>
                  <stat.icon className="h-5 w-5" style={{ color: "rgba(255,255,255,0.85)" }} />
                </div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: "white" }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="lg:w-[40%] w-full flex items-center justify-center px-6 py-12 lg:py-0"
        style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-[400px]">
          {/* Login Card */}
          <div className="rounded-[18px] p-8"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}>
            
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)" }}>
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: "#1E293B" }}>
                CATI E&M
              </span>
            </div>

            {/* Titles */}
            <h2 className="text-xl font-semibold mb-1" style={{ color: "#0F172A" }}>
              Sign in to your account
            </h2>
            <p className="text-sm mb-7" style={{ color: "#64748B" }}>
              Access your dashboard securely
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium" style={{ color: "#475569" }}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: "#94A3B8" }} />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="you@cati.local"
                    className="w-full h-12 pl-11 pr-4 rounded-[10px] text-sm outline-none transition-all duration-200"
                    style={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#3B82F6";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-medium" style={{ color: "#475569" }}>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: "#94A3B8" }} />
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 rounded-[10px] text-sm outline-none transition-all duration-200"
                    style={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#3B82F6";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium transition-colors duration-200 hover:underline"
                  style={{ color: "#3B82F6" }}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-[10px] text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                  boxShadow: "0 2px 8px rgba(30,58,138,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(0.5px)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
              >
                {loading ? "Signing in..." : (
                  <>Sign in securely <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
              <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>OR</span>
              <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
            </div>

            {/* SSO placeholder */}
            <button
              type="button"
              className="w-full h-11 rounded-[10px] text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "transparent",
                border: "1px solid #E2E8F0",
                color: "#475569",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <ShieldCheck className="h-4 w-4" />
              Sign in with SSO
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-6 flex items-center justify-center gap-1.5"
            style={{ color: "#94A3B8" }}>
            <Lock className="h-3 w-3" />
            Secure access · Role-based system
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
