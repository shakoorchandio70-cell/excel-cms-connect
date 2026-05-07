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
import AIChatFAB from "@/components/AIChatFAB";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const { isTechnician, isAdmin } = useUserRole();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showBell = isTechnician && !isAdmin;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Complaints", icon: FileText, href: "/complaints" },
    ...(isAdmin ? [{ label: "Inventory", icon: Package, href: "/inventory" }] : []),
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F6F0' }}>
      {/* Slim Icon Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[180px] flex flex-col py-4 transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: '#1A4731', borderRight: '1px solid #D4DCCE' }}
      >
        {/* Logo */}
        <div className="mb-6 px-4 flex items-center gap-2">
          <CatiLogo size={28} variant="light" />
          <span className="text-sm font-semibold tracking-wide" style={{ color: '#F5F6F0' }}>E&amp;M CMS</span>
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
                  background: active ? 'rgba(190,242,100,0.15)' : 'transparent',
                  color: active ? '#9CCC4A' : '#94A3B8',
                }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* Settings */}
          <button
            title="Settings"
            className="flex items-center gap-3 px-3 h-10 rounded-lg transition-colors text-sm font-medium"
            style={{ color: '#475569' }}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </button>
          {/* Sign Out */}
          <button
            onClick={signOut}
            title="Sign Out"
            className="flex items-center gap-3 px-3 h-10 rounded-lg transition-colors text-sm font-medium"
            style={{ color: '#94A3B8' }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </nav>
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
            background: '#FFFFFF',
            borderBottom: '1px solid #D4DCCE',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#475569' }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Brand text */}
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm font-semibold hidden lg:inline" style={{ color: '#1C1F1A' }}>E&M CMS</span>
          </div>

          {/* Search bar (center) */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 text-sm rounded-[7px] outline-none transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D4DCCE',
                  color: '#1C1F1A',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#76B041';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101,163,13,0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D4DCCE';
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
              style={{ background: 'rgba(101,163,13,0.15)', color: '#76B041' }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        <AIChatFAB userRole={isAdmin ? "admin" : isTechnician ? "technician" : "official"} />
      </div>
    </div>
  );
};

export default AppLayout;
