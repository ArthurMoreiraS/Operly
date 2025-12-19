import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, User, Bell, Loader2, Copy, ExternalLink, Save, Phone, Mail, MapPin, Lock, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: "",
    customUrl: "",
    address: "",
    phone: "",
    email: "",
  });

  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (settings) {
      setBusinessForm({
        businessName: settings.businessName || "",
        customUrl: settings.customUrl || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleBusinessUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(businessForm);
  };

  const updateAccountMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao alterar senha");
      }
      return response.json();
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Senha alterada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccountMutation.mutate({ name: accountForm.name });
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Preencha ambos os campos de senha");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await fetch("/api/auth/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatarUrl }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar foto");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast.success("Foto atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }
    
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 1.5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      uploadAvatarMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBookingUrl = () => {
    const url = businessForm.customUrl 
      ? `${window.location.origin}/agendar/${businessForm.customUrl}`
      : `${window.location.origin}/agendar`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleOpenBookingPage = () => {
    const url = businessForm.customUrl 
      ? `/agendar/${businessForm.customUrl}`
      : `/agendar`;
    window.open(url, '_blank');
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Configurações</h1>
        <p className="text-sm md:text-base text-gray-400">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="glass-card bg-white/5 border-white/5 p-1 h-auto w-full justify-start rounded-xl mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="business" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-3 md:px-4 py-2 flex gap-2 whitespace-nowrap text-sm">
            <Store className="w-4 h-4" /> <span className="hidden sm:inline">Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-3 md:px-4 py-2 flex gap-2 whitespace-nowrap text-sm">
            <User className="w-4 h-4" /> <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-400 rounded-lg px-3 md:px-4 py-2 flex gap-2 whitespace-nowrap text-sm">
            <Bell className="w-4 h-4" /> <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
        </TabsList>

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
                      value={businessForm.businessName} 
                      onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                      placeholder="Nome do seu estabelecimento"
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">URL Personalizada</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-1">
                        <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-md px-3 py-2 text-gray-400 text-sm flex items-center whitespace-nowrap">
                          /agendar/
                        </span>
                        <Input 
                          value={businessForm.customUrl}
                          onChange={(e) => setBusinessForm({...businessForm, customUrl: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          placeholder="seu-lava-rapido"
                          className="bg-white/5 border-white/10 text-white rounded-l-none" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="border-white/10 text-gray-300 hover:bg-white/10 shrink-0"
                          onClick={handleCopyBookingUrl}
                          data-testid="button-copy-url"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="border-white/10 text-gray-300 hover:bg-white/10 shrink-0"
                          onClick={handleOpenBookingPage}
                          data-testid="button-open-booking"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Este é o link que você pode compartilhar com seus clientes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Telefone/WhatsApp
                      </Label>
                      <Input 
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="bg-white/5 border-white/10 text-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input 
                        value={businessForm.email}
                        onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})}
                        placeholder="contato@seulavaauto.com.br"
                        className="bg-white/5 border-white/10 text-white" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Endereço
                    </Label>
                    <Input 
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                      placeholder="Rua das Lavagens, 123 - Centro"
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-save-business"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Perfil do Usuário</CardTitle>
              <CardDescription className="text-gray-400">Suas informações pessoais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-white/10">
                    <AvatarImage src={user?.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {uploadAvatarMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-avatar-file"
                  />
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={handleAvatarChange}
                    disabled={uploadAvatarMutation.isPending}
                    data-testid="button-change-photo"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Alterar Foto
                  </Button>
                </div>
              </div>

              <form onSubmit={handleAccountUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome Completo</Label>
                    <Input 
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input 
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white mt-4 w-full sm:w-auto"
                  data-testid="button-save-account"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Segurança</CardTitle>
              <CardDescription className="text-gray-400">Gerencie sua senha e segurança da conta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Senha Atual</Label>
                  <Input 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Nova Senha</Label>
                  <Input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white" 
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-white/10 text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={handlePasswordChange}
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Preferências de Notificação</CardTitle>
              <CardDescription className="text-gray-400">Configure como e quando você quer ser notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Lembretes WhatsApp</Label>
                  <p className="text-sm text-gray-400">Enviar lembretes automáticos para clientes antes do agendamento.</p>
                </div>
                <Switch 
                  checked={settings?.whatsappReminders ?? true}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ whatsappReminders: checked })}
                  data-testid="switch-whatsapp-reminders"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Alertas de Atraso</Label>
                  <p className="text-sm text-gray-400">Receba notificações quando um serviço estiver atrasado.</p>
                </div>
                <Switch 
                  checked={settings?.delayAlerts ?? true}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ delayAlerts: checked })}
                  data-testid="switch-delay-alerts"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Relatório Diário</Label>
                  <p className="text-sm text-gray-400">Receber um resumo do dia por email toda noite.</p>
                </div>
                <Switch 
                  checked={settings?.dailyReport ?? false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ dailyReport: checked })}
                  data-testid="switch-daily-report"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Horário de Funcionamento</CardTitle>
              <CardDescription className="text-gray-400">Em breve: Configure seus horários de atendimento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Configuração de horários disponível em breve.</p>
                <p className="text-sm mt-2">Por enquanto, os agendamentos estão disponíveis das 8h às 18h.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
