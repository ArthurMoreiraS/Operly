import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Info, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

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
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group services by category
  const groupedServices = services?.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {}) || {};

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

      {Object.entries(groupedServices).map(([category, categoryServices]: [string, any]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-white pl-1 border-l-4 border-primary/50">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryServices.map((service: any, i: number) => (
              <motion.div key={service.id} variants={item}>
                <Card className={`glass-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-300 relative ${service.isPopular ? 'ring-1 ring-primary/20' : ''}`}>
                  {service.isPopular && (
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
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white">R$ {parseFloat(service.price).toFixed(2)}</div>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {service.features.map((feature: string, f: number) => (
                          <div key={f} className="flex items-start gap-2 text-sm text-gray-400">
                            <Check className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

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

      {(!services || services.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum serviço cadastrado ainda.</p>
        </div>
      )}
    </motion.div>
  );
}
