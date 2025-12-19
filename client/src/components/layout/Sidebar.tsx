import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  Settings,
  LogOut
} from "lucide-react";
import Logo from "@assets/Letter_R_(1)_1766118629756.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agendamentos", href: "/schedule", icon: Calendar },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Serviços", href: "/services", icon: Wrench },
  { name: "Finanças", href: "/finance", icon: DollarSign },
  { name: "Configurações", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
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

      <nav className="flex-1 px-3 lg:px-4 space-y-1 lg:space-y-2 py-4">
        {navigation.map((item) => {
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
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-white/5">
        <div className="p-3 lg:p-4 rounded-2xl bg-white/5 backdrop-blur-md mb-3 lg:mb-4 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-400">Plano Pro</p>
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">Ativo</span>
          </div>
          <div className="w-full bg-gray-700/50 h-1.5 rounded-full mb-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[75%]" />
          </div>
          <p className="text-xs text-gray-300">75% da quota utilizada</p>
        </div>
        <button className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-gray-400 hover:text-white w-full transition-colors rounded-xl hover:bg-white/5 cursor-pointer hover:border hover:border-white/5">
          <LogOut className="w-5 h-5" />
          <span className="text-sm lg:text-base">Sair</span>
        </button>
      </div>
    </div>
  );
}
