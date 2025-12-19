import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Check, 
  X, 
  Play, 
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Logo from "@assets/Letter_R_(1)_1766118629756.png";

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

const testimonials = [
  {
    quote: "Fechamos 30% mais agendamentos desde que começamos a usar o Operly. A organização mudou nosso jogo.",
    name: "Carlos Silva",
    role: "Dono da Lava Rápido GO",
    metric: "+30% Conversão",
    avatar: "CS"
  },
  {
    quote: "Meus clientes adoram receber os lembretes automáticos. O faturamento dobrou em 3 meses.",
    name: "Mariana Costa",
    role: "Estética Automotiva Premium",
    metric: "2x Faturamento",
    avatar: "MC"
  },
  {
    quote: "Simples de usar e muito bonito. Meus funcionários aprenderam em 10 minutos.",
    name: "Ricardo Oliveira",
    role: "Clean Car Wash",
    metric: "Zero dor de cabeça",
    avatar: "RO"
  }
];

const beforeItems = [
  "WhatsApp lotado de mensagens não lidas",
  "Clientes esquecem e não aparecem (No-shows)",
  "Não sabe quanto faturou no fim do dia",
  "Agenda de papel rasurada e confusa"
];

const afterItems = [
  "Agenda organizada e automatizada",
  "Lembretes automáticos (Reduz no-shows em 50%)",
  "Dashboard financeiro em tempo real",
  "Histórico completo de cada cliente"
];

const logos = ["LAVAGO", "SPEEDWASH", "PROCLEAN", "AutoDetail", "CarShine"];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    teamSize: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) {
      toast.error("Preencha seu nome e WhatsApp");
      return;
    }
    toast.success("Obrigado! Entraremos em contato em breve.");
    setFormData({ name: "", whatsapp: "", email: "", teamSize: "" });
  };

  const goToDashboard = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#222a34]">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 border border-white/10 bg-[#222a34]">
              <img src={Logo} alt="Operly" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="text-xl font-bold text-white">Operly</span>
          </div>
          <Button 
            onClick={goToDashboard}
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/10"
            data-testid="button-login"
          >
            Entrar
          </Button>
        </div>
      </header>

      <motion.main 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-32">
          <motion.div variants={item} className="text-center max-w-4xl mx-auto">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-2" />
              Novidade: Agendamento via WhatsApp integrado
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Organize seu lava-rápido{" "}
              <span className="text-primary">além do WhatsApp</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Agendamentos, clientes e faturamento em um dashboard simples e inteligente. 
              Dê adeus à confusão e olá para o crescimento.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 text-base px-8"
                onClick={() => document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-demo-cta"
              >
                Quero uma demo grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 text-base px-8"
                onClick={goToDashboard}
                data-testid="button-how-it-works"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver como funciona
              </Button>
            </div>
          </motion.div>

          <motion.div 
            variants={item} 
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#222a34] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="glass-card border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="bg-[#1a2029] p-3 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">dashboard.operly.com.br</span>
                </div>
                <div className="p-6 bg-gradient-to-br from-[#222a34] to-[#1a2029]">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="glass-card border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Faturamento hoje</p>
                        <p className="text-2xl font-bold text-white">R$ 1.250,00</p>
                        <p className="text-xs text-emerald-400 mt-1">↑ +15% vs ontem</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Agendamentos</p>
                        <p className="text-2xl font-bold text-white">12</p>
                        <p className="text-xs text-blue-400 mt-1">3 confirmados</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Clientes</p>
                        <p className="text-2xl font-bold text-white">247</p>
                        <p className="text-xs text-primary mt-1">+8 esta semana</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="h-32 bg-white/5 rounded-xl flex items-center justify-center">
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-8 rounded-t bg-gradient-to-t from-primary/50 to-primary"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={item} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                O CRM para Lava Rápido <span className="text-primary">no Brasil</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Pare de perder dinheiro com a desorganização. Evolua sua gestão.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div variants={item}>
                <Card className="glass-card border-white/5 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <X className="w-5 h-5 text-red-400" />
                      Antes: O Caos
                    </h3>
                    <ul className="space-y-4">
                      {beforeItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <X className="w-5 h-5 text-red-400/50 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="glass-card border-primary/20 h-full bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-400" />
                      Depois: Operly
                    </h3>
                    <ul className="space-y-4">
                      {afterItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                          <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={item} className="text-center mt-10">
              <Button 
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={goToDashboard}
                data-testid="button-video-demo"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver demonstração em vídeo
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="glass-card border-white/5 h-full hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{testimonial.name}</p>
                          <p className="text-gray-500 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <Badge className="mt-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {testimonial.metric}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-white/5 overflow-hidden">
          <div className="flex gap-12 animate-marquee">
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <div 
                key={i} 
                className="text-2xl font-bold text-white/20 whitespace-nowrap"
              >
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section id="demo-form" className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
              <motion.div variants={item} className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Pronto para <span className="text-primary">profissionalizar?</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Agende uma demonstração gratuita e descubra como o Operly pode transformar seu lava-rápido.
                </p>
              </motion.div>

              <motion.div variants={item} className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Setup inicial gratuito</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Suporte via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Sem fidelidade, cancele quando quiser</span>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Nome Completo</label>
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Seu nome"
                            className="bg-white/5 border-white/10 text-white"
                            data-testid="input-demo-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">WhatsApp</label>
                          <Input 
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                            placeholder="(11) 99999-9999"
                            className="bg-white/5 border-white/10 text-white"
                            data-testid="input-demo-whatsapp"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Email</label>
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="seu@email.com"
                            className="bg-white/5 border-white/10 text-white"
                            data-testid="input-demo-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Tamanho da Equipe</label>
                          <Select value={formData.teamSize} onValueChange={(v) => setFormData({...formData, teamSize: v})}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-demo-team-size">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                              <SelectItem value="1-5">1-5 funcionários</SelectItem>
                              <SelectItem value="6-20">6-20 funcionários</SelectItem>
                              <SelectItem value="20+">Mais de 20 funcionários</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                        data-testid="button-submit-demo"
                      >
                        Agendar minha demo gratuita
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.main>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img src={Logo} alt="Operly" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-white">Operly</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Operly. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
