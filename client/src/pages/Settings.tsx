import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, User, Bell, Shield, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
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
              <div className="space-y-2">
                <Label className="text-gray-300">Nome Fantasia</Label>
                <Input defaultValue="Lava Rápido Express" className="bg-white/5 border-white/10 text-white" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">URL Personalizada</Label>
                <div className="flex">
                  <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-md px-3 py-2 text-gray-400 text-sm flex items-center">
                    operly.com.br/
                  </span>
                  <Input defaultValue="lava-express" className="bg-white/5 border-white/10 text-white rounded-l-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Endereço</Label>
                <Input defaultValue="Rua das Acácias, 123 - Centro" className="bg-white/5 border-white/10 text-white" />
              </div>
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Alertas de Atraso</Label>
                  <p className="text-sm text-gray-400">Me avise quando um serviço atrasar.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Relatório Diário</Label>
                  <p className="text-sm text-gray-400">Receber resumo do dia por email.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
