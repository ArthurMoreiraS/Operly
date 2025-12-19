import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Clock, Check, Loader2, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const categories = ["Lavagem", "Estética", "Polimento", "Higienização", "Outros"];

export default function Services() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [featuresInput, setFeaturesInput] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Lavagem",
    price: "",
    duration: "60",
    description: "",
    features: [] as string[],
    isPopular: false,
    isActive: true,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/services", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Serviço criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar serviço");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsEditOpen(false);
      setSelectedService(null);
      resetForm();
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar serviço");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDeleteOpen(false);
      setSelectedService(null);
      toast.success("Serviço excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir serviço");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Lavagem",
      price: "",
      duration: "60",
      description: "",
      features: [],
      isPopular: false,
      isActive: true,
    });
    setFeaturesInput("");
  };

  const handleCreate = () => {
    if (!formData.name || !formData.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    const features = featuresInput.split('\n').filter(f => f.trim());
    createMutation.mutate({
      ...formData,
      features,
      duration: parseInt(formData.duration),
    });
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    const features = featuresInput.split('\n').filter(f => f.trim());
    updateMutation.mutate({
      id: selectedService.id,
      data: {
        ...formData,
        features,
        duration: parseInt(formData.duration),
      },
    });
  };

  const openEdit = (service: any) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration.toString(),
      description: service.description || "",
      features: service.features || [],
      isPopular: service.isPopular,
      isActive: service.isActive,
    });
    setFeaturesInput((service.features || []).join('\n'));
    setIsEditOpen(true);
  };

  const openDelete = (service: any) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const groupedServices = services?.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {}) || {};

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
      className="space-y-6 md:space-y-8"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Catálogo de Serviços</h1>
          <p className="text-sm md:text-base text-gray-400">Configure seus serviços, preços e tempos.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none w-full md:w-auto md:self-end"
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-new-service"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]: [string, any]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-white pl-2 md:pl-1 border-l-4 border-primary/50">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categoryServices.map((service: any) => (
              <motion.div key={service.id} variants={item}>
                <Card className={`glass-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-300 relative ${service.isPopular ? 'ring-1 ring-primary/20' : ''}`}>
                  {service.isPopular && (
                    <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl backdrop-blur-md">
                      Mais vendido
                    </div>
                  )}
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors truncate">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white shrink-0 ml-2">R$ {parseFloat(service.price).toFixed(2)}</div>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                        {service.features.slice(0, 3).map((feature: string, f: number) => (
                          <div key={f} className="flex items-start gap-2 text-xs md:text-sm text-gray-400">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-500/80 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 3 && (
                          <p className="text-xs text-gray-500 pl-5">+{service.features.length - 3} mais...</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/10 hover:bg-white/10 hover:text-white text-gray-400 text-sm"
                        onClick={() => openEdit(service)}
                        data-testid={`edit-service-${service.id}`}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400 shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 text-gray-200">
                          <DropdownMenuItem 
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                            onClick={() => openEdit(service)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            className="focus:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                            onClick={() => openDelete(service)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {(!services || services.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum serviço cadastrado ainda.</p>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Novo Serviço</DialogTitle>
            <DialogDescription className="text-gray-400">Adicione um novo serviço ao catálogo.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Lavagem Completa"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Duração (min)</Label>
                <Input 
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Preço (R$) *</Label>
              <Input 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Descrição</Label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Breve descrição do serviço"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Itens inclusos (um por linha)</Label>
              <Textarea 
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Lavagem externa&#10;Aspiração interna&#10;Cera líquida"
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Marcar como popular</Label>
              <Switch 
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="border-white/10 text-gray-300 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Editar Serviço</DialogTitle>
            <DialogDescription className="text-gray-400">Atualize as informações do serviço.</DialogDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Duração (min)</Label>
                <Input 
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Preço (R$) *</Label>
              <Input 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Descrição</Label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Itens inclusos (um por linha)</Label>
              <Textarea 
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Marcar como popular</Label>
              <Switch 
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Serviço ativo</Label>
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }} className="border-white/10 text-gray-300 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card border-white/10 text-white w-[calc(100%-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Excluir Serviço</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o serviço "{selectedService?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 mt-4 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-white/10 text-gray-300 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(selectedService?.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
