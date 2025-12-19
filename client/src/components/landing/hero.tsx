import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dashboardImg from "@assets/image_1766123624933.png";

export function Hero() {
  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />

      <div className="container mx-auto max-w-6xl text-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Novidade: Agendamento via WhatsApp integrado
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Organize seu lava-rápido <br className="hidden md:block" />
            <span className="text-gradient-primary">além do WhatsApp</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Agendamentos, clientes e faturamento em um dashboard simples e inteligente.
            Dê adeus à confusão e olá para o crescimento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105"
              onClick={scrollToForm}
            >
              Quero uma demo grátis
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg bg-transparent border-white/10 hover:bg-white/5 transition-all"
            >
              Ver como funciona
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="rounded-3xl border border-white/10 bg-background/50 backdrop-blur-sm p-2 shadow-2xl">
            <img 
              src={dashboardImg} 
              alt="Operly Dashboard" 
              className="rounded-2xl w-full h-auto shadow-inner border border-white/5"
            />
            
            {/* Floating Elements for depth */}
            <div className="absolute -right-4 -bottom-8 md:-right-12 md:bottom-12 p-4 glassy-card rounded-2xl animate-in fade-in zoom-in duration-1000 delay-500 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  ↑
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento hoje</p>
                  <p className="text-lg font-bold text-white">R$ 1.250,00</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
