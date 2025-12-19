import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, User, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar configurações");
    },
  });

  const [formData, setFormData] = useState({
    businessName: "",
    customUrl: "",
    address: "",
  });

  const handleBusinessUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
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
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="glass-card bg-white/5 border-white/5 p-1 h-auto w-full justify-start rounded-xl mb-6">
          <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-4 py-2 flex gap-2">
            <User className="w-4 h-4" /> Conta
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-4 py-2 flex gap-2">
            <Store className="w-4 h-4" /> Negócio
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-4 py-2 flex gap-2">
            <Bell className="w-4 h-4" /> Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Perfil do Usuário</CardTitle>
              <CardDescription className="text-gray-400">Suas informações pessoais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-white/10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>RL</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Alterar Foto</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nome Completo</Label>
                  <Input defaultValue="Rafael Lavagens" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input defaultValue="rafael@operly.com.br" className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Informações da Loja</CardTitle>
              <CardDescription className="text-gray-400">Isso aparecerá na sua página de agendamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleBusinessUpdate}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome Fantasia</Label>
                    <Input 
                      value={formData.businessName || settings?.businessName || ""} 
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">URL Personalizada</Label>
                    <div className="flex">
                      <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-md px-3 py-2 text-gray-400 text-sm flex items-center">
                        operly.com.br/
                      </span>
                      <Input 
                        value={formData.customUrl || settings?.customUrl || ""}
                        onChange={(e) => setFormData({...formData, customUrl: e.target.value})}
                        className="bg-white/5 border-white/10 text-white rounded-l-none" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Endereço</Label>
                    <Input 
                      value={formData.address || settings?.address || ""}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>

                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Lembretes WhatsApp</Label>
                  <p className="text-sm text-gray-400">Enviar lembretes automáticos para clientes.</p>
                </div>
                <Switch 
                  checked={settings?.whatsappReminders}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ whatsappReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Alertas de Atraso</Label>
                  <p className="text-sm text-gray-400">Me avise quando um serviço atrasar.</p>
                </div>
                <Switch 
                  checked={settings?.delayAlerts}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ delayAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Relatório Diário</Label>
                  <p className="text-sm text-gray-400">Receber resumo do dia por email.</p>
                </div>
                <Switch 
                  checked={settings?.dailyReport}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ dailyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
