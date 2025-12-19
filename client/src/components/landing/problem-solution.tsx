import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-24 px-4 bg-black/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            O CRM para Lava Rápido no Brasil
          </h2>
          <p className="text-muted-foreground text-lg">
            Pare de perder dinheiro com a desorganização. Evolua sua gestão.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Before: Problem */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glassy-card p-8 rounded-3xl border-l-4 border-l-red-500/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <X size={20} />
              </div>
              <h3 className="text-2xl font-semibold">Antes: O Caos</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <X className="text-red-500 shrink-0 mt-1" size={18} />
                <span>WhatsApp lotado de mensagens não lidas</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <X className="text-red-500 shrink-0 mt-1" size={18} />
                <span>Clientes esquecem e não aparecem (No-shows)</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <X className="text-red-500 shrink-0 mt-1" size={18} />
                <span>Não sabe quanto faturou no fim do dia</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <X className="text-red-500 shrink-0 mt-1" size={18} />
                <span>Agenda de papel rasurada e confusa</span>
              </li>
            </ul>
          </motion.div>

          {/* After: Solution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glassy p-8 rounded-3xl border-l-4 border-l-primary relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Check size={20} />
              </div>
              <h3 className="text-2xl font-semibold text-white">Depois: Operly</h3>
            </div>
            
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3 text-white">
                <Check className="text-primary shrink-0 mt-1" size={18} />
                <span>Agenda organizada e automatizada</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <Check className="text-primary shrink-0 mt-1" size={18} />
                <span>Lembretes automáticos (Reduz no-shows em 50%)</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <Check className="text-primary shrink-0 mt-1" size={18} />
                <span>Dashboard financeiro em tempo real</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <Check className="text-primary shrink-0 mt-1" size={18} />
                <span>Histórico completo de cada cliente</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-center justify-between text-sm text-primary font-medium cursor-pointer group">
                <span>Ver demonstração em vídeo</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
