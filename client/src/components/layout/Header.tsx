import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function Header() {
  const { user, business, logout } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 lg:h-20 fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between px-4 pl-16 lg:pl-8 lg:px-8 py-4 glass-panel border-b border-white/5 bg-[#222a34]/80 backdrop-blur-xl">
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar cliente, veículo ou agendamento..." 
            className="pl-10 bg-white/5 border-white/5 rounded-xl text-gray-200 placeholder:text-gray-500 focus-visible:ring-primary/50 focus-visible:bg-white/10 transition-all h-9 lg:h-10 w-full"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6 ml-auto">
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" data-testid="button-notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#222a34]" />
        </button>

        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none" data-testid="button-user-menu">
            <div className="flex items-center gap-2 lg:gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-white/5 transition-colors">
              <Avatar className="h-8 w-8 lg:h-9 lg:w-9 border-2 border-white/10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {business ? getInitials(business.name) : 'OP'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs lg:text-sm font-medium text-white leading-none mb-0.5 lg:mb-1" data-testid="text-business-name">
                  {business?.name || 'Carregando...'}
                </p>
                <p className="text-[10px] lg:text-xs text-gray-400" data-testid="text-user-role">
                  {user?.role === 'admin' ? 'Admin' : 'Colaborador'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 text-gray-200">
            <DropdownMenuLabel className="text-gray-400 text-xs font-normal">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" data-testid="menu-item-profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <Link href="/settings">
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" data-testid="menu-item-settings">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
