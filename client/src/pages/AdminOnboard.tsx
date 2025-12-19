import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Building2, User, Mail, Phone, Lock, MapPin, Link as LinkIcon, ArrowLeft, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminOnboard() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState(searchParams.get("business") || "");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [address, setAddress] = useState("");
  const [userName, setUserName] = useState(searchParams.get("name") || "");
  const [userEmail, setUserEmail] = useState(searchParams.get("email") || "");
  const [userPassword, setUserPassword] = useState("");
  const [success, setSuccess] = useState<{ business: any; user: any } | null>(null);

  useEffect(() => {
    if (businessName && !slug) {
      setSlug(generateSlug(businessName));
    }
  }, [businessName]);

  const onboardMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Falha ao cadastrar cliente");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      
      const leadId = searchParams.get("leadId");
      if (leadId) {
        fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "converted" }),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardMutation.mutate({
      businessName,
      slug,
      phone,
      address,
      userName,
      userEmail,
      userPassword,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência" });
  };

  if (success) {
    const bookingUrl = `${window.location.origin}/agendar/${success.business.slug}`;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Cliente Cadastrado com Sucesso!</h1>
          <p className="text-gray-400 mb-8">
            O cliente agora pode acessar o sistema com as credenciais abaixo
          </p>

          <div className="glass-card rounded-xl p-6 text-left space-y-4 mb-6">
            <h3 className="font-semibold text-white mb-4">Credenciais de Acesso</h3>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Negócio</p>
                <p className="text-white font-medium">{success.business.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white font-medium">{success.user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(success.user.email)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Senha</p>
                <p className="text-white font-medium">{userPassword}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(userPassword)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Link de Agendamento Público</p>
                <p className="text-primary font-medium text-sm break-all">{bookingUrl}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bookingUrl)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/admin/leads">
              <Button variant="outline" className="border-white/10">
                Ver Leads
              </Button>
            </Link>
            <Button onClick={() => { setSuccess(null); setBusinessName(""); setSlug(""); setPhone(""); setAddress(""); setUserName(""); setUserEmail(""); setUserPassword(""); }}>
              Cadastrar Outro Cliente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/leads">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Cadastrar Novo Cliente</h1>
        <p className="text-gray-400 text-sm mt-1">
          Crie uma conta para um cliente que já pagou
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Dados do Negócio
          </h2>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Lava-Rápido *</Label>
              <Input
                id="businessName"
                placeholder="Ex: Auto Brilho Premium"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setSlug(generateSlug(e.target.value));
                }}
                className="bg-white/5 border-white/10"
                required
                data-testid="input-business-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="flex items-center gap-2">
                <LinkIcon className="w-3 h-3" />
                URL Personalizada *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/agendar/</span>
                <Input
                  id="slug"
                  placeholder="auto-brilho-premium"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="input-slug"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/10"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Endereço
                </Label>
                <Input
                  id="address"
                  placeholder="Cidade, Estado"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white/5 border-white/10"
                  data-testid="input-address"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados do Usuário (Admin)
          </h2>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nome do Responsável</Label>
              <Input
                id="userName"
                placeholder="João Silva"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-white/5 border-white/10"
                data-testid="input-user-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail" className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email de Acesso *
              </Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="cliente@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="bg-white/5 border-white/10"
                required
                data-testid="input-user-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword" className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Senha de Acesso *
              </Label>
              <Input
                id="userPassword"
                type="text"
                placeholder="Crie uma senha para o cliente"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="bg-white/5 border-white/10"
                required
                data-testid="input-user-password"
              />
              <p className="text-xs text-gray-500">
                A senha será visível para você copiar e enviar ao cliente
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-lg font-semibold"
          disabled={onboardMutation.isPending}
          data-testid="button-submit-onboard"
        >
          {onboardMutation.isPending ? "Cadastrando..." : "Cadastrar Cliente"}
        </Button>
      </form>
    </div>
  );
}
