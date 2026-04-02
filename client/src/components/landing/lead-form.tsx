import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { formatWhatsApp } from "@/lib/formatters";

const formSchema = z.object({
  name: z.string()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  whatsapp: z.string()
    .min(10, "WhatsApp inválido")
    .max(20, "WhatsApp inválido")
    .regex(/^[\d\s()+-]+$/, "WhatsApp deve conter apenas números"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  size: z.string({ required_error: "Selecione o tamanho do negócio" }),
});

export function LeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          whatsapp: values.whatsapp,
          email: values.email,
          teamSize: values.size,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao enviar");
      }
      
      setIsSuccess(true);
      toast({
        title: "Solicitação recebida!",
        description: "Nossa equipe entrará em contato em até 2 horas.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="lead-form" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto max-w-4xl">
        <div className="glassy p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl relative">
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Pronto para <br/>
                <span className="text-primary">profissionalizar?</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Agende uma demonstração gratuita e descubra como o Operly pode transformar seu lava-rápido.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</div>
                  <span className="text-sm font-medium">Setup inicial gratuito</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</div>
                  <span className="text-sm font-medium">Suporte via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</div>
                  <span className="text-sm font-medium">Sem fidelidade, cancele quando quiser</span>
                </div>
              </div>
            </div>

            <div className="bg-card/50 p-6 rounded-2xl border border-white/5">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="h-20 w-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowRight size={40} className="-rotate-45" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sucesso!</h3>
                  <p className="text-muted-foreground">
                    Recebemos seus dados. Aguarde nosso contato em breve no seu WhatsApp.
                  </p>
                  <Button 
                    className="mt-6 w-full" 
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                  >
                    Voltar
                  </Button>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(11) 9 9999-9999" 
                              {...field} 
                              onChange={(e) => field.onChange(formatWhatsApp(e.target.value))}
                              className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho da Equipe</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-5">1-5 funcionários</SelectItem>
                              <SelectItem value="6-20">6-20 funcionários</SelectItem>
                              <SelectItem value="20+">Mais de 20 funcionários</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Agendar minha demo gratuita"}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
