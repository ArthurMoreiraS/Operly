import { Bell, Search, ChevronDown, LogOut, User, Settings, Calendar, CheckCircle } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Header() {
  const { user, business, logout } = useAuth();

  const { data: todayAppointments } = useQuery({
    queryKey: ["/api/appointments", "today"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/appointments?date=${today}`, { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const pendingAppointments = todayAppointments?.filter((a: any) => a.status === 'pending' || a.status === 'confirmed') || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-14 lg:h-20 fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between px-3 pl-14 sm:px-4 sm:pl-16 lg:pl-8 lg:px-8 py-2 lg:py-4 glass-panel border-b border-white/5 bg-[#222a34]/80 backdrop-blur-xl">
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

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" data-testid="button-notifications">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {pendingAppointments.length > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#222a34]" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 glass-card border-white/10 p-0">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notificações</h3>
              <p className="text-xs text-gray-400">Agendamentos de hoje</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {pendingAppointments.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                  Nenhum agendamento pendente hoje
                </div>
              ) : (
                pendingAppointments.map((apt: any) => (
                  <div key={apt.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {apt.customer?.name || 'Cliente'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {apt.service?.name} - {format(new Date(apt.scheduledAt), "HH:mm", { locale: ptBR })}
                        </p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                          apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {apt.status === 'pending' ? 'Pendente' : 'Confirmado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/schedule">
              <div className="p-3 text-center text-sm text-primary hover:bg-white/5 cursor-pointer transition-colors">
                Ver agenda completa
              </div>
            </Link>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none" data-testid="button-user-menu">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 cursor-pointer p-1 pr-1 sm:pr-2 rounded-full hover:bg-white/5 transition-colors">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 border-2 border-white/10">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] sm:text-xs">
                  {user ? getInitials(user.name) : 'OP'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs lg:text-sm font-medium text-white leading-none mb-0.5 lg:mb-1 max-w-[100px] md:max-w-none truncate" data-testid="text-business-name">
                  {business?.name || 'Carregando...'}
                </p>
                <p className="text-[10px] lg:text-xs text-gray-400" data-testid="text-user-role">
                  {user?.role === 'admin' ? 'Admin' : 'Colaborador'}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" />
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
