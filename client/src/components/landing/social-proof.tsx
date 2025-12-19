import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Dono da Lava Rápido GO",
    text: "Fechamos 30% mais agendamentos desde que começamos a usar o Operly. A organização mudou nosso jogo.",
    metric: "+30% Conversão"
  },
  {
    name: "Mariana Costa",
    role: "Estética Automotiva Premium",
    text: "Meus clientes adoram receber os lembretes automáticos. O faturamento dobrou em 3 meses.",
    metric: "2x Faturamento"
  },
  {
    name: "Ricardo Oliveira",
    role: "Clean Car Wash",
    text: "Simples de usar e muito bonito. Meus funcionários aprenderam em 10 minutos.",
    metric: "Zero dor de cabeça"
  }
];

export function SocialProof() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glassy-card p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors duration-300">
              <div className="mb-4 flex gap-1 text-primary">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="text-lg text-white mb-6 leading-relaxed">"{t.text}"</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Mock Logos */}
          <span className="text-xl font-bold font-serif tracking-widest">LAVA<span className="text-primary">GO</span></span>
          <span className="text-xl font-bold tracking-tighter italic">SPEEDWASH</span>
          <span className="text-xl font-bold uppercase border-2 border-current px-2">PROCLEAN</span>
          <span className="text-xl font-bold font-mono">AutoDetail</span>
        </div>
      </div>
    </section>
  );
}
