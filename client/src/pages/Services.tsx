import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Info, Check } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    category: "Lavagem",
    items: [
      { name: "Lavagem Simples", price: "R$ 40,00", time: "40 min", popular: true, features: ["Shampoo neutro", "Limpeza de rodas", "Aspiração interna", "Pretinho nos pneus"] },
      { name: "Lavagem Detalhada", price: "R$ 80,00", time: "1h 30min", popular: false, features: ["Tudo da simples", "Cera líquida", "Limpeza de cantos", "Hidratação plásticos externos"] },
      { name: "Lavagem Motor", price: "R$ 60,00", time: "45 min", popular: false, features: ["Desengraxante", "Verniz de motor", "Proteção componentes"] },
    ]
  },
  {
    category: "Estética",
    items: [
      { name: "Polimento Comercial", price: "R$ 250,00", time: "4h", popular: true, features: ["Remoção riscos leves", "Brilho intenso", "Proteção 3 meses"] },
      { name: "Higienização Interna", price: "R$ 180,00", time: "3h", popular: false, features: ["Bancos e teto", "Carpetes", "Eliminação odores", "Hidratação couro"] },
      { name: "Vitrificação", price: "R$ 800,00", time: "2 dias", popular: false, features: ["Proteção 3 anos", "Hidrorrepelência", "Brilho profundo", "Certificado garantia"] },
    ]
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Services() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Catálogo de Serviços</h1>
          <p className="text-gray-400">Configure seus serviços, preços e tempos.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {services.map((category, idx) => (
        <div key={idx} className="space-y-4">
          <h2 className="text-xl font-semibold text-white pl-1 border-l-4 border-primary/50">{category.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((service, i) => (
              <motion.div key={i} variants={item}>
                <Card className={`glass-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-300 relative ${service.popular ? 'ring-1 ring-primary/20' : ''}`}>
                  {service.popular && (
                    <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl backdrop-blur-md">
                      Mais vendido
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{service.time}</span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white">{service.price}</div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, f) => (
                        <div key={f} className="flex items-start gap-2 text-sm text-gray-400">
                          <Check className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 hover:text-white text-gray-400">
                        Editar
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400">
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
