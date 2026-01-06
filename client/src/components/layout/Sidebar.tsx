import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  Settings,
  LogOut,
  UserPlus,
  Building2
} from "lucide-react";
import Logo from "@assets/Letter_R_(1)_1766118629756.png";
import { useAuth } from "@/hooks/useAuth";

// Navigation items with owner-only flag
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, ownerOnly: false },
  { name: "Agendamentos", href: "/schedule", icon: Calendar, ownerOnly: false },
  { name: "Clientes", href: "/customers", icon: Users, ownerOnly: false },
  { name: "Serviços", href: "/services", icon: Wrench, ownerOnly: false },
  { name: "Finanças", href: "/finance", icon: DollarSign, ownerOnly: true },
  { name: "Configurações", href: "/settings", icon: Settings, ownerOnly: true },
];

const adminNavigation = [
  { name: "Leads", href: "/admin/leads", icon: UserPlus },
  { name: "Novo Cliente", href: "/admin/onboard", icon: Building2 },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen w-64 glass-panel flex flex-col transition-all duration-300">
      <div className="p-6 lg:p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-white/10 bg-[#222a34]">
          <img 
            src={Logo}
            alt="Operly Logo" 
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">Operly</h1>
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-1 lg:space-y-2 py-4 overflow-y-auto">
        {user?.role === 'admin' ? (
          <>
            <div className="pb-2 px-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Administração</p>
            </div>
            {adminNavigation.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href} onClick={handleNavClick}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                      )}
                    />
                    <span className="font-medium text-sm lg:text-base">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </>
        ) : (
          navigation
            .filter((item) => !item.ownerOnly || (user?.businessRole ?? 'owner') === 'owner')
            .map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={handleNavClick}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                      )}
                    />
                    <span className="font-medium text-sm lg:text-base">{item.name}</span>
                  </div>
                </Link>
              );
            })
        )}
      </nav>

      <div className="p-3 lg:p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-gray-400 hover:text-white w-full transition-colors rounded-xl hover:bg-white/5 cursor-pointer hover:border hover:border-white/5"
          data-testid="button-sidebar-logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm lg:text-base">Sair</span>
        </button>
      </div>
    </div>
  );
}
