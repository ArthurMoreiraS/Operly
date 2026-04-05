import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Filter, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, getYear, getMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
  "in-progress": "bg-blue-500/20 border-blue-500/50 text-blue-200",
  pending: "bg-amber-500/20 border-amber-500/50 text-amber-200",
  completed: "bg-gray-500/20 border-gray-500/50 text-gray-200",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  "in-progress": "Em Andamento",
  pending: "Pendente",
  completed: "Concluído",
};

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    serviceId: "",
    scheduledTime: "09:00",
    status: "pending",
  });

  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${dateStr}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

  const { data: monthCounts } = useQuery({
    queryKey: ["/api/appointments/counts", getYear(currentMonth), getMonth(currentMonth) + 1],
    queryFn: async () => {
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth) + 1;
      const response = await fetch(`/api/appointments/counts/${year}/${month}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch appointment counts");
      return response.json() as Promise<Record<string, number>>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", formData.customerId],
    queryFn: async () => {
      if (!formData.customerId) return [];
      const response = await fetch(`/api/vehicles?customerId=${formData.customerId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
    enabled: !!formData.customerId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Agendamento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar agendamento");
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast.success("Status atualizado!");
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      vehicleId: "",
      serviceId: "",
      scheduledTime: "09:00",
      status: "pending",
    });
    setSelectedHour(null);
  };

  const handleCreateAppointment = () => {
    if (!formData.customerId || !formData.vehicleId || !formData.serviceId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const selectedService = services?.find((s: any) => s.id === parseInt(formData.serviceId));
    const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    createAppointmentMutation.mutate({
      customerId: parseInt(formData.customerId),
      vehicleId: parseInt(formData.vehicleId),
      serviceId: parseInt(formData.serviceId),
      scheduledAt: scheduledAt.toISOString(),
      duration: selectedService?.duration || 60,
      status: formData.status,
    });
  };

  const openNewAppointmentDialog = (hour?: number) => {
    if (hour !== undefined) {
      setFormData(prev => ({ ...prev, scheduledTime: `${hour.toString().padStart(2, '0')}:00` }));
      setSelectedHour(hour);
    }
    setIsDialogOpen(true);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Week view helpers
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredAppointments = filterStatus 
    ? appointments?.filter((a: any) => a.status === filterStatus) 
    : appointments;

  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments?.filter((a: any) => 
      isSameDay(new Date(a.scheduledAt), day)
    ) || [];
  };

  const hasAppointmentsOnDay = (day: Date) => {
    return appointments?.some((a: any) => isSameDay(new Date(a.scheduledAt), day)) || false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Agendamentos</h1>
          <p className="text-sm md:text-base text-gray-400">Gerencie sua agenda de serviços.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className={`glass-card border-white/10 hover:bg-white/10 text-white flex-1 md:flex-none ${showFilters ? 'bg-white/10' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-filters"
          >
            <Filter className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filtrar</span>
          </Button>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none flex-1 md:flex-none"
            onClick={() => openNewAppointmentDialog()}
            data-testid="button-new-appointment"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card border-white/5 p-3 md:p-4 rounded-xl"
        >
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant={filterStatus === null ? "default" : "outline"}
              className={filterStatus === null ? "bg-primary" : "border-white/10 text-gray-300"}
              onClick={() => setFilterStatus(null)}
            >
              Todos
            </Button>
            {Object.entries(statusLabels).map(([status, label]) => (
              <Button 
                key={status}
                size="sm" 
                variant={filterStatus === status ? "default" : "outline"}
                className={filterStatus === status ? "bg-primary" : "border-white/10 text-gray-300"}
                onClick={() => setFilterStatus(status)}
              >
                {label}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar - Calendar and Summary (collapsible on mobile) */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <Card className="glass-card border-white/5">
            <CardContent className="p-0">
              <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white/5 rounded-full transition-colors"
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <span className="font-semibold text-white capitalize text-sm md:text-base">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white/5 rounded-full transition-colors"
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-2 md:p-4 grid grid-cols-7 gap-0.5 md:gap-1 text-center text-xs md:text-sm">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, idx) => (
                  <span key={`weekday-${idx}`} className="text-gray-500 font-medium h-6 md:h-8 flex items-center justify-center">{d}</span>
                ))}
                {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-6 md:h-8" />
                ))}
                {daysInMonth.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const appointmentCount = monthCounts?.[dateKey] || 0;
                  const hasAppointments = appointmentCount > 0;
                  return (
                    <button 
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center transition-all text-xs md:text-sm mx-auto relative
                        ${isSelected 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : isToday 
                            ? 'bg-white/10 text-white' 
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      data-testid={`day-${format(day, 'yyyy-MM-dd')}`}
                    >
                      {format(day, 'd')}
                      {hasAppointments && !isSelected && (
                        <span className="absolute bottom-0 md:bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary card - hidden on mobile, show as horizontal stats */}
          <Card className="glass-card border-white/5 hidden lg:block">
            <CardHeader className="pb-2">
              <h3 className="text-white text-sm font-semibold">Resumo do Dia</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-medium">{appointments?.length || 0} agendamentos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Confirmados</span>
                <span className="text-emerald-400 font-medium">
                  {appointments?.filter((a: any) => a.status === 'confirmed').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Pendentes</span>
                <span className="text-amber-400 font-medium">
                  {appointments?.filter((a: any) => a.status === 'pending').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Em andamento</span>
                <span className="text-blue-400 font-medium">
                  {appointments?.filter((a: any) => a.status === 'in-progress').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile summary - horizontal stats bar */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
            <div className="flex-shrink-0 bg-white/5 rounded-lg px-3 py-2 text-center min-w-[70px]">
              <div className="text-white font-bold text-lg">{appointments?.length || 0}</div>
              <div className="text-gray-400 text-[10px]">Total</div>
            </div>
            <div className="flex-shrink-0 bg-emerald-500/10 rounded-lg px-3 py-2 text-center min-w-[70px]">
              <div className="text-emerald-400 font-bold text-lg">{appointments?.filter((a: any) => a.status === 'confirmed').length || 0}</div>
              <div className="text-gray-400 text-[10px]">Confirmado</div>
            </div>
            <div className="flex-shrink-0 bg-amber-500/10 rounded-lg px-3 py-2 text-center min-w-[70px]">
              <div className="text-amber-400 font-bold text-lg">{appointments?.filter((a: any) => a.status === 'pending').length || 0}</div>
              <div className="text-gray-400 text-[10px]">Pendente</div>
            </div>
            <div className="flex-shrink-0 bg-blue-500/10 rounded-lg px-3 py-2 text-center min-w-[70px]">
              <div className="text-blue-400 font-bold text-lg">{appointments?.filter((a: any) => a.status === 'in-progress').length || 0}</div>
              <div className="text-gray-400 text-[10px]">Andamento</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card className="glass-card border-white/5 h-full min-h-[400px] md:min-h-[600px]">
            <CardHeader className="border-b border-white/5 p-3 md:pb-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 sm:gap-2 text-white font-medium">
                  <button
                    onClick={() => {
                      if (viewMode === 'day') {
                        setSelectedDate(subDays(selectedDate, 1));
                      } else {
                        setSelectedDate(subWeeks(selectedDate, 1));
                      }
                    }}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                    data-testid="nav-prev"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <CalendarIcon className="w-4 h-4 text-primary hidden sm:block" />
                  <span className="capitalize text-xs sm:text-sm md:text-base text-center flex-1 sm:flex-none sm:min-w-[180px] md:min-w-[200px]">
                    {viewMode === 'day' 
                      ? format(selectedDate, "EEE, dd MMM", { locale: ptBR })
                      : `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(addDays(weekStart, 6), "dd MMM", { locale: ptBR })}`
                    }
                  </span>
                  <button
                    onClick={() => {
                      if (viewMode === 'day') {
                        setSelectedDate(addDays(selectedDate, 1));
                      } else {
                        setSelectedDate(addWeeks(selectedDate, 1));
                      }
                    }}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                    data-testid="nav-next"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 self-center sm:self-auto">
                  <button 
                    className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'day' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setViewMode('day')}
                    data-testid="view-day"
                  >
                    Dia
                  </button>
                  <button 
                    className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'week' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setViewMode('week')}
                    data-testid="view-week"
                  >
                    Semana
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative overflow-y-auto max-h-[350px] md:max-h-[550px]">
              {viewMode === 'day' ? (
                <>
                  <div className="absolute left-12 md:left-16 top-0 bottom-0 w-px bg-white/5 z-0" />
                  
                  <div className="divide-y divide-white/5">
                    {timeSlots.map((hour) => {
                      const hourAppointments = filteredAppointments?.filter((a: any) => {
                        const appointmentHour = new Date(a.scheduledAt).getHours();
                        return appointmentHour === hour;
                  }) || [];
                  
                  return (
                    <div key={hour} className="flex min-h-[60px] md:min-h-[80px] group hover:bg-white/[0.02] transition-colors relative">
                      <div className="w-12 md:w-16 py-2 md:py-4 text-center text-[10px] md:text-xs text-gray-500 font-mono border-r border-white/5 shrink-0">
                        {hour}:00
                      </div>
                      <div className="flex-1 p-1 md:p-2 relative">
                        {hourAppointments.map((appointment: any) => {
                          const durationHours = Math.max(appointment.duration / 60, 0.5);
                          return (
                            <motion.div 
                              key={appointment.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute top-1 left-1 right-1 md:left-2 md:right-2 z-10 p-2 md:p-3 rounded-lg md:rounded-xl border backdrop-blur-md shadow-sm cursor-pointer hover:shadow-md transition-all ${statusColors[appointment.status] || statusColors.pending}`}
                              style={{ minHeight: `${Math.min(durationHours * 60 - 10, 50)}px` }}
                              data-testid={`appointment-${appointment.id}`}
                            >
                              <div className="flex justify-between items-start gap-1 md:gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-xs md:text-sm truncate">{appointment.customer?.name}</h4>
                                  <p className="text-[10px] md:text-xs opacity-80 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                                    {format(new Date(appointment.scheduledAt), 'HH:mm')}
                                    <span className="hidden sm:inline"> - {appointment.duration} min</span>
                                  </p>
                                </div>
                                <Select
                                  value={appointment.status}
                                  onValueChange={(value) => updateAppointmentMutation.mutate({ id: appointment.id, status: value })}
                                >
                                  <SelectTrigger className="h-5 md:h-6 w-auto text-[8px] md:text-[10px] bg-black/20 border-white/10 text-inherit px-1 md:px-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-[10px] md:text-xs mt-1 opacity-70 truncate hidden sm:block">
                                {appointment.vehicle?.brand} {appointment.vehicle?.model} • {appointment.service?.name}
                              </p>
                            </motion.div>
                          );
                        })}

                        {hourAppointments.length === 0 && (
                          <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:text-primary hover:bg-primary/10 h-6 md:h-8 text-xs"
                              onClick={() => openNewAppointmentDialog(hour)}
                              data-testid={`add-appointment-${hour}`}
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" /> 
                              <span className="hidden sm:inline">Adicionar</span>
                              <span className="sm:hidden">+</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
                </>
              ) : (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="min-w-[500px] md:min-w-[700px]">
                    {/* Week header */}
                    <div className="grid grid-cols-8 border-b border-white/5">
                      <div className="w-10 md:w-16 p-1 md:p-2 text-[10px] md:text-xs text-gray-500 font-medium border-r border-white/5"></div>
                      {weekDays.map((day) => (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 md:p-2 text-center border-r border-white/5 last:border-r-0 ${
                            isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="text-[10px] md:text-xs text-gray-400 uppercase">
                            {format(day, 'EEE', { locale: ptBR })}
                          </div>
                          <div className={`text-xs md:text-sm font-medium ${
                            isSameDay(day, selectedDate) ? 'text-primary' : 'text-white'
                          }`}>
                            {format(day, 'd')}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Time slots */}
                    <div className="divide-y divide-white/5">
                      {timeSlots.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 min-h-[50px] md:min-h-[60px]">
                          <div className="w-10 md:w-16 py-2 text-center text-[10px] md:text-xs text-gray-500 font-mono border-r border-white/5">
                            {hour}:00
                          </div>
                          {weekDays.map((day) => {
                            const dayHourAppointments = getAppointmentsForDay(day).filter((a: any) => 
                              new Date(a.scheduledAt).getHours() === hour
                            );
                            return (
                              <div 
                                key={`${day.toISOString()}-${hour}`} 
                                className="border-r border-white/5 last:border-r-0 p-0.5 md:p-1 relative group hover:bg-white/[0.02]"
                              >
                                {dayHourAppointments.map((appointment: any) => (
                                  <div
                                    key={appointment.id}
                                    className={`text-[8px] md:text-[10px] p-0.5 md:p-1 rounded mb-0.5 md:mb-1 truncate cursor-pointer ${statusColors[appointment.status] || statusColors.pending}`}
                                    title={`${appointment.customer?.name} - ${appointment.service?.name}`}
                                    onClick={() => {
                                      setSelectedDate(day);
                                      setViewMode('day');
                                    }}
                                  >
                                    <div className="font-medium truncate">{appointment.customer?.name}</div>
                                    <div className="opacity-70 hidden md:block">{format(new Date(appointment.scheduledAt), 'HH:mm')}</div>
                                  </div>
                                ))}
                                {dayHourAppointments.length === 0 && (
                                  <div 
                                    className="w-full h-full min-h-[30px] md:min-h-[40px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                    onClick={() => {
                                      setSelectedDate(day);
                                      openNewAppointmentDialog(hour);
                                    }}
                                  >
                                    <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">Preencha os dados para criar um novo agendamento.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 md:py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Data</Label>
              <Input 
                value={format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                disabled
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Horário</Label>
              <Select 
                value={formData.scheduledTime} 
                onValueChange={(value) => setFormData({...formData, scheduledTime: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {timeSlots.map((hour) => (
                    <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Cliente *</Label>
              <Select 
                value={formData.customerId} 
                onValueChange={(value) => setFormData({...formData, customerId: value, vehicleId: ""})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {customers?.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Veículo *</Label>
              <Select 
                value={formData.vehicleId} 
                onValueChange={(value) => setFormData({...formData, vehicleId: value})}
                disabled={!formData.customerId}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white disabled:opacity-50">
                  <SelectValue placeholder={formData.customerId ? "Selecione o veículo" : "Selecione um cliente primeiro"} />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {vehicles?.map((vehicle: any) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Serviço *</Label>
              <Select 
                value={formData.serviceId} 
                onValueChange={(value) => setFormData({...formData, serviceId: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {services?.map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - R$ {parseFloat(service.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => { setIsDialogOpen(false); resetForm(); }}
              className="border-white/10 text-gray-300 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={createAppointmentMutation.isPending}
            >
              {createAppointmentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
