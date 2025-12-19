import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Search, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  MessageCircle, 
  Car,
  Star,
  Loader2,
  Calendar,
  Edit,
  Trash2,
  Eye,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Customers() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const { data: selectedVehicles } = useQuery({
    queryKey: ["/api/vehicles", selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const response = await fetch(`/api/vehicles?customerId=${selectedCustomer.id}`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
    enabled: !!selectedCustomer?.id && isDetailsOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Cliente criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar cliente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsEditOpen(false);
      setSelectedCustomer(null);
      resetForm();
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      toast.success("Cliente excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir cliente");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", status: "active" });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    updateMutation.mutate({ id: selectedCustomer.id, data: formData });
  };

  const openEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      status: customer.status,
    });
    setIsEditOpen(true);
  };

  const openDelete = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const openDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const goToSchedule = (customerId?: number) => {
    navigate("/schedule");
  };

  const filteredCustomers = customers?.filter((customer: any) => {
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Clientes</h1>
          <p className="text-sm md:text-base text-gray-400">Gerencie sua base de clientes e veículos.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none w-full md:w-auto md:self-end"
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-new-customer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card className="glass-card border-white/5">
        <div className="p-3 md:p-4 border-b border-white/5 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, telefone ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/5 text-gray-200 placeholder:text-gray-500 focus-visible:ring-primary/50"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button 
              variant={statusFilter === null ? "default" : "outline"} 
              size="sm" 
              className={statusFilter === null ? "bg-primary shrink-0" : "glass-card border-white/10 hover:bg-white/10 text-gray-300 shrink-0"}
              onClick={() => setStatusFilter(null)}
            >
              Todos
            </Button>
            <Button 
              variant={statusFilter === "vip" ? "default" : "ghost"} 
              size="sm" 
              className={statusFilter === "vip" ? "bg-primary shrink-0" : "text-gray-400 hover:text-white hover:bg-white/5 shrink-0"}
              onClick={() => setStatusFilter("vip")}
            >
              <Star className="w-3 h-3 mr-1" /> VIPs
            </Button>
            <Button 
              variant={statusFilter === "active" ? "default" : "ghost"} 
              size="sm" 
              className={statusFilter === "active" ? "bg-primary shrink-0" : "text-gray-400 hover:text-white hover:bg-white/5 shrink-0"}
              onClick={() => setStatusFilter("active")}
            >
              Ativos
            </Button>
            <Button 
              variant={statusFilter === "inactive" ? "default" : "ghost"} 
              size="sm" 
              className={statusFilter === "inactive" ? "bg-primary shrink-0" : "text-gray-400 hover:text-white hover:bg-white/5 shrink-0"}
              onClick={() => setStatusFilter("inactive")}
            >
              Inativos
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredCustomers?.map((customer: any) => {
            const initials = customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            
            return (
              <motion.div 
                key={customer.id} 
                variants={item}
                className="p-3 md:p-4 hover:bg-white/[0.02] transition-colors"
                data-testid={`customer-row-${customer.id}`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-sm md:text-base">
                          <span className="truncate">{customer.name}</span>
                          {customer.status === "vip" && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 truncate">{customer.phone}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 hover:bg-green-500/20 rounded text-green-400 opacity-50 cursor-not-allowed"
                              title="Em breve: integração WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                            <button 
                              className="p-1 hover:bg-blue-500/20 rounded text-blue-400 opacity-50 cursor-not-allowed"
                              title="Em breve: integração telefone"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 text-gray-200">
                          <DropdownMenuItem 
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                            onClick={() => openDetails(customer)}
                          >
                            <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                            onClick={() => openEdit(customer)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                            onClick={() => goToSchedule(customer.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" /> Novo Agendamento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            className="focus:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                            onClick={() => openDelete(customer)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-white/5 text-gray-300 border-white/5 font-normal text-xs">
                        <Car className="w-3 h-3 mr-1 opacity-50" /> {customer.vehicleCount || 0} veículo(s)
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${
                          customer.status === 'vip' 
                            ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' 
                            : customer.status === 'active'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                        }`}
                      >
                        {customer.status === 'vip' ? 'VIP' : customer.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {(!filteredCustomers || filteredCustomers.length === 0) && (
          <div className="p-8 text-center text-gray-400">
            <p>{searchTerm || statusFilter ? "Nenhum cliente encontrado com esses filtros." : "Nenhum cliente cadastrado ainda."}</p>
          </div>
        )}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Novo Cliente</DialogTitle>
            <DialogDescription className="text-gray-400">Preencha os dados do novo cliente.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome completo"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone *</Label>
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
                placeholder="email@exemplo.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="border-white/10 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Editar Cliente</DialogTitle>
            <DialogDescription className="text-gray-400">Atualize os dados do cliente.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone *</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }} className="border-white/10 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Excluir Cliente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o cliente "{selectedCustomer?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-white/10 text-gray-300">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(selectedCustomer?.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-lg sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              {selectedCustomer?.name}
              {selectedCustomer?.status === "vip" && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase">Telefone</span>
                <p className="text-white">{selectedCustomer?.phone}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Email</span>
                <p className="text-white">{selectedCustomer?.email || "-"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Status</span>
                <p className="text-white capitalize">{selectedCustomer?.status}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Veículos Cadastrados</h4>
              {selectedVehicles && selectedVehicles.length > 0 ? (
                <div className="space-y-2">
                  {selectedVehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Car className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white text-sm">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-xs text-gray-400">{vehicle.plate} • {vehicle.color} • {vehicle.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Nenhum veículo cadastrado.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="border-white/10 text-gray-300">
              Fechar
            </Button>
            <Button onClick={() => { setIsDetailsOpen(false); goToSchedule(selectedCustomer?.id); }} className="bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
