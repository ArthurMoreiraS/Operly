import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Download, 
  FileText,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const monthlyData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Fev', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Abr', revenue: 2780, expenses: 3908 },
  { name: 'Mai', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];

const serviceMixData = [
  { name: 'Lavagem Simples', value: 400, color: '#e07954' },
  { name: 'Polimento', value: 300, color: '#2a9d8f' },
  { name: 'Higienização', value: 300, color: '#e9c46a' },
  { name: 'Outros', value: 200, color: '#264653' },
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

export default function Finance() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Finanças</h1>
          <p className="text-gray-400">Controle financeiro completo da sua operação.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-card border-white/10 hover:bg-white/10 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-none">
            <FileText className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                +12.5%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Receita Total (Mês)</p>
            <h3 className="text-3xl font-bold text-white mt-1">R$ 14.250,00</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                <TrendingUp className="w-6 h-6 rotate-180" />
              </div>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                +4.2%
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Despesas (Mês)</p>
            <h3 className="text-3xl font-bold text-white mt-1">R$ 3.840,00</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                R$ 85,00 avg
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Lucro Líquido</p>
            <h3 className="text-3xl font-bold text-white mt-1">R$ 10.410,00</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
           <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
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
                      tickFormatter={(value) => `R$${value/1000}k`} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="revenue" fill="#e07954" radius={[4, 4, 0, 0]} name="Receita" />
                    <Bar dataKey="expenses" fill="#374151" radius={[4, 4, 0, 0]} name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
           </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-1">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Mix de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                       itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">1.2k</p>
                    <p className="text-xs text-gray-500">Serviços</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {serviceMixData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{Math.round((item.value / 1200) * 100)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
             {[
               { id: "#OS-0293", client: "João Silva", desc: "Lavagem Completa", date: "Hoje, 14:30", amount: "R$ 40,00", status: "Pago" },
               { id: "#OS-0292", client: "Maria Oliveira", desc: "Polimento", date: "Hoje, 11:00", amount: "R$ 250,00", status: "Pendente" },
               { id: "#OS-0291", client: "Pedro Santos", desc: "Higienização", date: "Ontem, 16:45", amount: "R$ 180,00", status: "Pago" },
             ].map((t, i) => (
               <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                 <div className="flex items-center gap-4">
                   <div className="bg-white/5 p-2.5 rounded-lg text-gray-400">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-white font-medium">{t.desc}</p>
                     <p className="text-xs text-gray-400">{t.id} • {t.client}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-white font-bold">{t.amount}</p>
                   <p className={`text-xs ${t.status === "Pago" ? "text-emerald-400" : "text-amber-400"}`}>{t.status}</p>
                 </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
