import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  MessageCircle, 
  Car,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const customers = [
  { 
    id: 1, 
    name: "João Silva", 
    phone: "(11) 99999-9999", 
    vehicles: ["Honda Civic", "Fiat Uno"], 
    visits: 12, 
    lastVisit: "10 Dez 2025", 
    status: "VIP",
    avatar: "JS"
  },
  { 
    id: 2, 
    name: "Maria Oliveira", 
    phone: "(11) 98888-8888", 
    vehicles: ["Toyota Corolla"], 
    visits: 5, 
    lastVisit: "15 Dez 2025", 
    status: "Active",
    avatar: "MO"
  },
  { 
    id: 3, 
    name: "Carlos Souza", 
    phone: "(11) 97777-7777", 
    vehicles: ["Jeep Compass"], 
    visits: 1, 
    lastVisit: "01 Dez 2025", 
    status: "New",
    avatar: "CS"
  },
  { 
    id: 4, 
    name: "Ana Santos", 
    phone: "(11) 96666-6666", 
    vehicles: ["Fiat Toro", "HB20"], 
    visits: 8, 
    lastVisit: "Today", 
    status: "Active",
    avatar: "AS"
  },
  { 
    id: 5, 
    name: "Pedro Lima", 
    phone: "(11) 95555-5555", 
    vehicles: ["VW Golf"], 
    visits: 0, 
    lastVisit: "-", 
    status: "Inactive",
    avatar: "PL"
  },
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

export default function Customers() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-gray-400">Gerencie sua base de clientes e veículos.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card className="glass-card border-white/5">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, telefone ou placa..." 
              className="pl-10 bg-white/5 border-white/5 text-gray-200 placeholder:text-gray-500 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass-card border-white/10 hover:bg-white/10 text-gray-300">
              Todos
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
              VIPs
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
              Inativos
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {customers.map((customer) => (
            <motion.div 
              key={customer.id} 
              variants={item}
              className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group"
            >
              <Avatar className="h-12 w-12 border-2 border-white/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{customer.avatar}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <div>
                  <h3 className="font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                    {customer.name}
                    {customer.status === "VIP" && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className="text-xs text-gray-400">{customer.phone}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-green-500/20 rounded text-green-400"><MessageCircle className="w-3 h-3" /></button>
                      <button className="p-1 hover:bg-blue-500/20 rounded text-blue-400"><Phone className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Veículos</span>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {customer.vehicles.map((v, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 font-normal">
                        <Car className="w-3 h-3 mr-1 opacity-50" /> {v}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                   <span className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">Histórico</span>
                   <p className="text-sm text-gray-300">{customer.visits} visitas</p>
                   <p className="text-xs text-gray-500">Última: {customer.lastVisit}</p>
                </div>

                <div className="flex items-center justify-center sm:justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10 text-gray-200">
                      <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Novo Agendamento</DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer text-red-400 focus:text-red-400">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5 flex justify-center">
          <Button variant="ghost" className="text-sm text-gray-400 hover:text-white">Carregar mais</Button>
        </div>
      </Card>
    </motion.div>
  );
}
