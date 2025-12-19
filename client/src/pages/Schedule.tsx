import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
  "in-progress": "bg-blue-500/20 border-blue-500/50 text-blue-200",
  pending: "bg-amber-500/20 border-amber-500/50 text-amber-200",
  completed: "bg-gray-500/20 border-gray-500/50 text-gray-200",
};

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${dateStr}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

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
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agendamentos</h1>
          <p className="text-gray-400">Gerencie sua agenda de serviços.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="glass-card border-white/10 hover:bg-white/10 text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card className="glass-card border-white/5">
            <CardContent className="p-0">
               <div className="p-4 border-b border-white/5 flex items-center justify-between">
                 <button className="p-1 hover:bg-white/5 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                 <span className="font-semibold text-white">{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</span>
                 <button className="p-1 hover:bg-white/5 rounded-full"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
               </div>
               <div className="p-4 grid grid-cols-7 gap-2 text-center text-sm">
                 {["D", "S", "T", "Q", "Q", "S", "S"].map((d, idx) => (
                   <span key={`weekday-${idx}`} className="text-gray-500 font-medium">{d}</span>
                 ))}
                 {Array.from({length: 31}, (_, i) => {
                   const day = i + 1;
                   const isSelected = day === selectedDate.getDate();
                   return (
                     <button 
                      key={`day-${day}`}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-300 hover:bg-white/5'}`}
                     >
                       {day}
                     </button>
                   );
                 })}
               </div>
            </CardContent>
           </Card>

           <Card className="glass-card border-white/5">
             <CardHeader>
               <h3 className="text-white text-sm font-semibold">Próximos Lembretes</h3>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                 <div>
                   <p className="text-sm text-white">Confirmar agendamentos</p>
                   <p className="text-xs text-gray-500">Hoje</p>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="glass-card border-white/5 h-full min-h-[600px]">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-medium">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span>{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button className="px-3 py-1 text-xs rounded-md bg-white/10 text-white font-medium">Dia</button>
                  <button className="px-3 py-1 text-xs rounded-md text-gray-400 hover:text-white transition-colors">Semana</button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="absolute left-16 top-0 bottom-0 w-px bg-white/5 z-0" />
              
              <div className="divide-y divide-white/5">
                {timeSlots.map((hour) => {
                  const hourAppointments = appointments?.filter((a: any) => {
                    const appointmentHour = new Date(a.scheduledAt).getHours();
                    return appointmentHour === hour;
                  }) || [];
                  
                  return (
                    <div key={hour} className="flex min-h-[80px] group hover:bg-white/[0.02] transition-colors relative">
                      <div className="w-16 py-4 text-center text-xs text-gray-500 font-mono border-r border-white/5 shrink-0">
                        {hour}:00
                      </div>
                      <div className="flex-1 p-2 relative">
                        {hourAppointments.map((appointment: any) => {
                          const durationHours = appointment.duration / 60;
                          return (
                            <motion.div 
                              key={appointment.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute top-1 left-2 right-2 z-10 p-3 rounded-xl border backdrop-blur-md shadow-sm cursor-pointer hover:shadow-md transition-all ${statusColors[appointment.status] || statusColors.pending}`}
                              style={{ height: `${durationHours * 80 - 10}px` }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-sm">{appointment.customer?.name}</h4>
                                  <p className="text-xs opacity-80 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(appointment.scheduledAt), 'HH:mm')} - {appointment.duration} min
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-black/20 border-white/10 text-inherit backdrop-blur-sm">
                                  {appointment.service?.name}
                                </Badge>
                              </div>
                              <p className="text-xs mt-2 opacity-70 flex items-center gap-1 font-mono">
                                {appointment.vehicle?.brand} {appointment.vehicle?.model} - {appointment.vehicle?.plate || 'Sem placa'}
                              </p>
                            </motion.div>
                          );
                        })}

                        {hourAppointments.length === 0 && (
                           <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-8">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar
                              </Button>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
