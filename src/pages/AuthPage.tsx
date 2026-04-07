import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { CatiLogo } from "@/components/BrandLogo";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#07090F' }}>
      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 15% 20%, rgba(0,212,255,0.05) 0%, transparent 70%)', animation: 'auth-pulse-glow 8s ease-in-out infinite' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 85% 80%, rgba(139,92,246,0.04) 0%, transparent 70%)', animation: 'auth-pulse-glow 8s ease-in-out infinite 4s' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #1E2535 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      {/* Floating hexagons */}
      <svg className="absolute pointer-events-none" width="120" height="120" viewBox="0 0 120 120" style={{ top: '10%', left: '8%', opacity: 0.06, animation: 'auth-float-1 20s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#00D4FF" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="80" height="80" viewBox="0 0 120 120" style={{ top: '60%', right: '12%', opacity: 0.05, animation: 'auth-float-2 25s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#8B5CF6" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="60" height="60" viewBox="0 0 120 120" style={{ bottom: '15%', left: '20%', opacity: 0.04, animation: 'auth-float-3 18s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#00D4FF" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="100" height="100" viewBox="0 0 120 120" style={{ top: '25%', right: '30%', opacity: 0.03, animation: 'auth-float-1 22s ease-in-out infinite 3s' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#8B5CF6" strokeWidth="1.5"/>
      </svg>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        {/* Card */}
        <div className="rounded-xl p-8" style={{ background: '#12161F', border: '1px solid #1E2535' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <CatiLogo size={36} />
            <div>
              <p className="text-base font-semibold" style={{ color: '#F1F5F9' }}>E&M CMS</p>
              <p className="text-[11px]" style={{ color: '#475569' }}>CATI · Hyderabad</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-1" style={{ color: '#F1F5F9' }}>
            Sign in to your account
          </h2>
          <p className="text-sm mb-7" style={{ color: '#64748B' }}>
            Access your dashboard securely
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: '#475569' }} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="you@cati.local"
                  className="w-full h-12 pl-11 pr-4 rounded-[7px] text-sm outline-none transition-all duration-200"
                  style={{ background: '#12161F', border: '1px solid #1E2535', color: '#F1F5F9' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#00D4FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1E2535'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: '#475569' }} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-[7px] text-sm outline-none transition-all duration-200"
                  style={{ background: '#12161F', border: '1px solid #1E2535', color: '#F1F5F9' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#00D4FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1E2535'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium hover:underline" style={{ color: '#00D4FF' }}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[7px] text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
              style={{ background: '#00D4FF', color: '#07090F' }}
            >
              {loading ? "Signing in..." : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#1E2535' }} />
            <span className="text-xs font-medium" style={{ color: '#475569' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: '#1E2535' }} />
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-[7px] text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
            style={{ background: 'transparent', border: '1px solid #1E2535', color: '#94A3B8' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Sign in with SSO
          </button>
        </div>

        <p className="text-center text-xs mt-6 flex items-center justify-center gap-1.5" style={{ color: '#475569' }}>
          <Lock className="h-3 w-3" />
          Secure access · Role-based system
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
