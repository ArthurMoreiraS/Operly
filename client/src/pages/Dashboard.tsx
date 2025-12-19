import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarPlus, 
  UserPlus, 
  Car, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const data = [
  { name: "Seg", value: 1200 },
  { name: "Ter", value: 2100 },
  { name: "Qua", value: 1800 },
  { name: "Qui", value: 2400 },
  { name: "Sex", value: 3200 },
  { name: "Sab", value: 3800 },
  { name: "Dom", value: 1500 },
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

export default function Dashboard() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bom dia, Rafael 👋</h1>
          <p className="text-gray-400">Aqui está o resumo da sua operação hoje.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-card border-white/10 hover:bg-white/10 text-white">
            <Clock className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
            <CalendarPlus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Faturamento Hoje", value: "R$ 1.240", change: "+12%", trend: "up", icon: AlertCircle }, // Using AlertCircle as placeholder if needed, but dollar sign is better. Wait, I can customize.
          { title: "Agendamentos", value: "18", change: "+4", trend: "up", icon: Car },
          { title: "Ticket Médio", value: "R$ 85", change: "-2%", trend: "down", icon: UserPlus },
          { title: "Taxa Ocupação", value: "92%", change: "+15%", trend: "up", icon: CheckCircle2 },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="glass-card border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="flex items-center text-xs">
                  {stat.trend === "up" ? (
                    <span className="text-emerald-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stat.change}
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      {stat.change}
                    </span>
                  )}
                  <span className="text-gray-500 ml-2">vs. ontem</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Receita Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e07954" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e07954" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#e07954" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions / Recent */}
        <motion.div variants={item} className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Agenda Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "14:00", client: "João Silva", car: "Honda Civic", type: "Lavagem Completa", status: "Confirmado" },
                  { time: "15:30", client: "Maria Oliveira", car: "Toyota Corolla", type: "Polimento", status: "Em andamento" },
                  { time: "17:00", client: "Carlos Souza", car: "Jeep Compass", type: "Higienização", status: "Pendente" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold font-mono">
                      {item.time}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.client}</h4>
                      <p className="text-xs text-gray-400">{item.car} • {item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10">
                Ver agenda completa
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 bg-linear-to-br from-primary/20 to-transparent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Atrasos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-200">2 veículos atrasados</p>
                  <p className="text-xs text-red-300/70 mt-1">Verifique o box de lavagem 3 e 4.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
