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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#F7F8F4' }}>
      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 15% 20%, rgba(101,163,13,0.05) 0%, transparent 70%)', animation: 'auth-pulse-glow 8s ease-in-out infinite' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 85% 80%, rgba(124,58,237,0.04) 0%, transparent 70%)', animation: 'auth-pulse-glow 8s ease-in-out infinite 4s' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #E4E8DD 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      {/* Floating hexagons */}
      <svg className="absolute pointer-events-none" width="120" height="120" viewBox="0 0 120 120" style={{ top: '10%', left: '8%', opacity: 0.06, animation: 'auth-float-1 20s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#65A30D" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="80" height="80" viewBox="0 0 120 120" style={{ top: '60%', right: '12%', opacity: 0.05, animation: 'auth-float-2 25s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#7C3AED" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="60" height="60" viewBox="0 0 120 120" style={{ bottom: '15%', left: '20%', opacity: 0.04, animation: 'auth-float-3 18s ease-in-out infinite' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#65A30D" strokeWidth="1.5"/>
      </svg>
      <svg className="absolute pointer-events-none" width="100" height="100" viewBox="0 0 120 120" style={{ top: '25%', right: '30%', opacity: 0.03, animation: 'auth-float-1 22s ease-in-out infinite 3s' }}>
        <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="none" stroke="#7C3AED" strokeWidth="1.5"/>
      </svg>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        {/* Card */}
        <div className="rounded-xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E4E8DD' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <CatiLogo size={36} />
            <div>
              <p className="text-base font-semibold" style={{ color: '#0F1F17' }}>E&M CMS</p>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>CATI · Hyderabad</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-1" style={{ color: '#0F1F17' }}>
            Sign in to your account
          </h2>
          <p className="text-sm mb-7" style={{ color: '#64748B' }}>
            Access your dashboard securely
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: '#94A3B8' }} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="you@cati.local"
                  className="w-full h-12 pl-11 pr-4 rounded-[7px] text-sm outline-none transition-all duration-200"
                  style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#65A30D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101,163,13,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E4E8DD'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px]" style={{ color: '#94A3B8' }} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-[7px] text-sm outline-none transition-all duration-200"
                  style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#65A30D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101,163,13,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E4E8DD'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium hover:underline" style={{ color: '#65A30D' }}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[7px] text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
              style={{ background: '#65A30D', color: '#F7F8F4' }}
            >
              {loading ? "Signing in..." : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#E4E8DD' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: '#E4E8DD' }} />
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-[7px] text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
            style={{ background: 'transparent', border: '1px solid #E4E8DD', color: '#475569' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Sign in with SSO
          </button>
        </div>

        <p className="text-center text-xs mt-6 flex items-center justify-center gap-1.5" style={{ color: '#94A3B8' }}>
          <Lock className="h-3 w-3" />
          Secure access · Role-based system
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
