import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  DollarSign, 
  Download, 
  FileText,
  TrendingUp,
  CreditCard,
  Loader2,
  MoreHorizontal,
  Check,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Finance() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    serviceId: "",
    paymentMethod: "pix",
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/service-orders"],
    queryFn: async () => {
      const response = await fetch("/api/service-orders");
      if (!response.ok) throw new Error("Failed to fetch service orders");
      return response.json();
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", formData.customerId],
    queryFn: async () => {
      if (!formData.customerId) return [];
      const response = await fetch(`/api/customers/${formData.customerId}/vehicles`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
    enabled: !!formData.customerId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Ordem de serviço criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar ordem de serviço");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/service-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update service order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast.success("Ordem de serviço atualizada!");
    },
    onError: () => {
      toast.error("Erro ao atualizar ordem de serviço");
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      vehicleId: "",
      serviceId: "",
      paymentMethod: "pix",
    });
  };

  const handleCreate = () => {
    if (!formData.customerId || !formData.vehicleId || !formData.serviceId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const service = services?.find((s: any) => s.id === parseInt(formData.serviceId));
    
    createMutation.mutate({
      customerId: parseInt(formData.customerId),
      vehicleId: parseInt(formData.vehicleId),
      serviceId: parseInt(formData.serviceId),
      amount: service?.price || "0",
      paymentStatus: "pending",
      paymentMethod: formData.paymentMethod,
    });
  };

  const handleMarkPaid = (order: any) => {
    updateMutation.mutate({
      id: order.id,
      data: { paymentStatus: "paid", paidAt: new Date().toISOString() },
    });
  };

  const handleExportReport = () => {
    if (!orders || orders.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const csvContent = [
      ["ID", "Cliente", "Serviço", "Valor", "Status", "Método", "Data"].join(","),
      ...orders.map((order: any) => [
        order.id,
        order.customer?.name || "-",
        order.service?.name || "-",
        `R$ ${parseFloat(order.amount).toFixed(2)}`,
        order.paymentStatus === "paid" ? "Pago" : "Pendente",
        order.paymentMethod || "-",
        format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR }),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast.success("Relatório exportado com sucesso!");
  };

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const totalRevenue = orders?.reduce((sum: number, order: any) => 
    order.paymentStatus === 'paid' ? sum + parseFloat(order.amount) : sum, 0) || 0;

  const pendingRevenue = orders?.reduce((sum: number, order: any) => 
    order.paymentStatus === 'pending' ? sum + parseFloat(order.amount) : sum, 0) || 0;

  const serviceMixData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const serviceCount: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      const name = order.service?.name || 'Outros';
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });

    const colors = ['#e07954', '#2a9d8f', '#e9c46a', '#264653', '#f4a261', '#457b9d'];
    return Object.entries(serviceCount).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [orders]);

  const monthlyData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: date,
        name: format(date, 'MMM', { locale: ptBR }),
        revenue: 0,
      };
    });

    orders.forEach((order: any) => {
      if (order.paymentStatus !== 'paid') return;
      const orderDate = new Date(order.createdAt);
      const monthIndex = last6Months.findIndex(m => 
        orderDate >= startOfMonth(m.month) && orderDate <= endOfMonth(m.month)
      );
      if (monthIndex !== -1) {
        last6Months[monthIndex].revenue += parseFloat(order.amount);
      }
    });

    return last6Months;
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Finanças</h1>
          <p className="text-sm md:text-base text-gray-400">Controle financeiro completo da sua operação.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="glass-card border-white/10 hover:bg-white/10 text-white"
            onClick={handleExportReport}
            data-testid="button-export-report"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none"
            onClick={() => setIsCreateOpen(true)}
            data-testid="button-new-os"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Total
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Receita Total</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">R$ {totalRevenue.toFixed(2)}</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                Pendente
              </Badge>
            </div>
            <p className="text-sm text-gray-400">A Receber</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">R$ {pendingRevenue.toFixed(2)}</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                OSs
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Ordens de Serviço</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{orders?.length || 0}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `R$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`} 
                      />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        formatter={(value: any) => [`R$ ${parseFloat(value).toFixed(2)}`, 'Receita']}
                      />
                      <Bar dataKey="revenue" fill="#e07954" radius={[4, 4, 0, 0]} name="Receita" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-1">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Mix de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full relative">
                {serviceMixData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceMixData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Sem dados</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{orders?.length || 0}</p>
                    <p className="text-xs text-gray-500">OSs</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {serviceMixData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {orders?.slice(0, 10).map((order: any) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-3 md:p-4 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5 cursor-pointer"
                onClick={() => openDetails(order)}
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="bg-white/5 p-2 md:p-2.5 rounded-lg text-gray-400 shrink-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm md:text-base truncate">{order.service?.name || 'Serviço'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      OS #{order.id} • {order.customer?.name} • {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-white font-bold text-sm md:text-base">R$ {parseFloat(order.amount).toFixed(2)}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] md:text-xs ${
                        order.paymentStatus === "paid" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400 h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10 text-gray-200">
                      <DropdownMenuItem 
                        className="focus:bg-white/10 focus:text-white cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); openDetails(order); }}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                      </DropdownMenuItem>
                      {order.paymentStatus !== "paid" && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            className="focus:bg-emerald-500/20 text-emerald-400 focus:text-emerald-400 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleMarkPaid(order); }}
                          >
                            <Check className="w-4 h-4 mr-2" /> Marcar como Pago
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhuma transação registrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Nova Ordem de Serviço</DialogTitle>
            <DialogDescription className="text-gray-400">Registre uma nova venda de serviço.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Cliente *</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value, vehicleId: ""})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {customers?.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.customerId && (
              <div className="space-y-2">
                <Label className="text-gray-300">Veículo *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Selecione o veículo" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {vehicles?.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.brand} {vehicle.model} {vehicle.plate && `(${vehicle.plate})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-300">Serviço *</Label>
              <Select value={formData.serviceId} onValueChange={(value) => setFormData({...formData, serviceId: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {services?.filter((s: any) => s.isActive).map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - R$ {parseFloat(service.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Método de Pagamento</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="border-white/10 text-gray-300 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Detalhes da OS #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase">Cliente</span>
                  <p className="text-white">{selectedOrder.customer?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Veículo</span>
                  <p className="text-white">{selectedOrder.vehicle?.brand} {selectedOrder.vehicle?.model}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Serviço</span>
                  <p className="text-white">{selectedOrder.service?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Valor</span>
                  <p className="text-white font-bold">R$ {parseFloat(selectedOrder.amount).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Status</span>
                  <p className={selectedOrder.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}>
                    {selectedOrder.paymentStatus === "paid" ? "Pago" : "Pendente"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Método</span>
                  <p className="text-white capitalize">{selectedOrder.paymentMethod || "-"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Criado em</span>
                  <p className="text-white">{format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                </div>
                {selectedOrder.paidAt && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Pago em</span>
                    <p className="text-white">{format(new Date(selectedOrder.paidAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="border-white/10 text-gray-300 w-full sm:w-auto">
              Fechar
            </Button>
            {selectedOrder?.paymentStatus !== "paid" && (
              <Button 
                onClick={() => { handleMarkPaid(selectedOrder); setIsDetailsOpen(false); }} 
                className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
              >
                <Check className="w-4 h-4 mr-2" /> Marcar como Pago
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
