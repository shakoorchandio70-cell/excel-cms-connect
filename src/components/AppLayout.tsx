import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, LogOut, Menu, X, Package, User, Settings, Search, Bell
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { CatiLogo } from "@/components/BrandLogo";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const { isTechnician, isAdmin } = useUserRole();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showBell = isTechnician && !isAdmin;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Complaints", icon: FileText, href: "/complaints" },
    ...(isAdmin ? [{ label: "Inventory", icon: Package, href: "/inventory" }] : []),
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#07090F' }}>
      {/* Slim Icon Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[180px] flex flex-col py-4 transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: '#0C1018', borderRight: '1px solid #1E2535' }}
      >
        {/* Logo */}
        <div className="mb-6 px-4">
          <CatiLogo size={28} />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 h-10 rounded-lg transition-colors text-sm font-medium"
                style={{
                  background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                  color: active ? '#00D4FF' : '#94A3B8',
                }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Settings + Logout */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <button
            title="Settings"
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#475569' }}
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={signOut}
            title="Sign Out"
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#475569' }}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <header
          className="flex items-center px-4 lg:px-6"
          style={{
            height: '54px',
            background: '#0C1018',
            borderBottom: '1px solid #1E2535',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#94A3B8' }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Brand text */}
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm font-semibold hidden lg:inline" style={{ color: '#F1F5F9' }}>E&M CMS</span>
          </div>

          {/* Search bar (center) */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 text-sm rounded-[7px] outline-none transition-all duration-200"
                style={{
                  background: '#12161F',
                  border: '1px solid #1E2535',
                  color: '#F1F5F9',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00D4FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1E2535';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-3 ml-auto">
            {showBell && <NotificationBell />}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
