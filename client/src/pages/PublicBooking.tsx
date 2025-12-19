import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Car, User, Check, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Logo from "@assets/Letter_R_(1)_1766118629756.png";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const carBrands = [
  "Chevrolet", "Fiat", "Ford", "Honda", "Hyundai", "Jeep", 
  "Nissan", "Peugeot", "Renault", "Toyota", "Volkswagen", "Outro"
];

export default function PublicBooking() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    brand: "",
    model: "",
    plate: "",
    color: "",
    serviceId: "",
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments", selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${dateStr}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to book appointment");
      return response.json();
    },
    onSuccess: () => {
      setBookingComplete(true);
      toast.success("Agendamento realizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao realizar agendamento. Tente novamente.");
    },
  });

  const activeServices = services?.filter((s: any) => s.isActive) || [];

  const getAvailableSlots = () => {
    if (!selectedDate || !appointments) return timeSlots;
    const bookedHours = appointments.map((a: any) => {
      const date = new Date(a.scheduledAt);
      return `${date.getHours().toString().padStart(2, '0')}:00`;
    });
    return timeSlots.filter(slot => !bookedHours.includes(slot));
  };

  const availableSlots = getAvailableSlots();

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !formData.serviceId || !formData.name || !formData.phone || !formData.brand || !formData.model) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const selectedService = activeServices.find((s: any) => s.id === parseInt(formData.serviceId));

    bookMutation.mutate({
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      },
      vehicle: {
        brand: formData.brand,
        model: formData.model,
        plate: formData.plate,
        color: formData.color,
      },
      appointment: {
        serviceId: parseInt(formData.serviceId),
        scheduledAt: scheduledAt.toISOString(),
        duration: selectedService?.duration || 60,
      },
    });
  };

  const canProceed = () => {
    if (step === 1) return !!formData.serviceId;
    if (step === 2) return selectedDate && selectedTime;
    if (step === 3) return formData.name && formData.phone && formData.brand && formData.model;
    return false;
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-[#222a34] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50 mix-blend-overlay"></div>
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Agendamento Confirmado!</h1>
          <p className="text-gray-400 mb-6">
            Seu agendamento foi realizado para {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Você receberá uma confirmação por WhatsApp em breve.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90"
          >
            Fazer Novo Agendamento
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222a34] py-6 px-4">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50 mix-blend-overlay"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-lg mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-white/10 bg-[#222a34]">
            <img src={Logo} alt="Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agendar Serviço</h1>
            <p className="text-sm text-gray-400">Escolha o melhor horário para você</p>
          </div>
        </div>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-primary text-white' : 'bg-white/10 text-gray-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs mt-2 ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                {s === 1 ? 'Serviço' : s === 2 ? 'Horário' : 'Dados'}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Escolha o Serviço</h2>
              <div className="space-y-3">
                {activeServices.map((service: any) => (
                  <Card 
                    key={service.id}
                    className={`glass-card border-white/5 cursor-pointer transition-all hover:border-primary/30 ${
                      formData.serviceId === service.id.toString() ? 'ring-2 ring-primary border-primary/50' : ''
                    }`}
                    onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} min</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary">R$ {parseFloat(service.price).toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Escolha a Data</h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {next7Days.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedDate && isSameDay(day, selectedDate) 
                          ? 'bg-primary text-white' 
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                      <div className="text-lg font-bold">{format(day, 'd')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Escolha o Horário</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.length > 0 ? availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedTime === slot 
                            ? 'bg-primary text-white' 
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {slot}
                      </button>
                    )) : (
                      <p className="col-span-full text-center text-gray-400 py-4">
                        Nenhum horário disponível para este dia.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Seus Dados
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome completo *</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Seu nome"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">WhatsApp *</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" /> Dados do Veículo
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Marca *</Label>
                      <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          {carBrands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Modelo *</Label>
                      <Input 
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        placeholder="Ex: Civic"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Placa</Label>
                      <Input 
                        value={formData.plate}
                        onChange={(e) => setFormData({...formData, plate: e.target.value})}
                        placeholder="ABC-1234"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor</Label>
                      <Input 
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        placeholder="Ex: Preto"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canProceed() || bookMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {bookMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirmar Agendamento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
