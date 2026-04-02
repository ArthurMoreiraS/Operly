import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, Building2, Calendar, CheckCircle, Clock, XCircle, MoreVertical, UserPlus, Archive, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { toast } from "sonner";
import { formatPhoneDisplay } from "@/lib/formatters";

interface Lead {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  teamSize: string | null;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  contacted: { label: "Contatado", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Phone },
  converted: { label: "Convertido", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  lost: { label: "Perdido", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

export default function Leads() {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      if (variables.status === "archived") {
        toast.success("Lead arquivado com sucesso");
      }
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast.success("Lead excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir lead");
    },
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie os contatos captados pela landing page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Novos", value: stats.new, color: "text-blue-400" },
          { label: "Contatados", value: stats.contacted, color: "text-yellow-400" },
          { label: "Convertidos", value: stats.converted, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum lead captado ainda</p>
            <p className="text-gray-500 text-sm mt-1">
              Os leads aparecerão aqui quando alguém preencher o formulário da landing page
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Lead
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Contato
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                    Data
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => {
                  const status = statusConfig[lead.status] || statusConfig.new;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors" data-testid={`row-lead-${lead.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{lead.name}</p>
                            {lead.teamSize && (
                              <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <Building2 className="w-3 h-3" />
                                {lead.teamSize}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="w-3 h-3" />
                            {formatPhoneDisplay(lead.whatsapp)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(lead.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`button-lead-actions-${lead.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/10">
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: lead.id, status: "contacted" })}
                              className="cursor-pointer"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Marcar como Contatado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: lead.id, status: "converted" })}
                              className="cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Convertido
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: lead.id, status: "lost" })}
                              className="cursor-pointer text-red-400"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Marcar como Perdido
                            </DropdownMenuItem>
                            <Link href={`/admin/onboard?leadId=${lead.id}&name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}&phone=${encodeURIComponent(lead.whatsapp)}`}>
                              <DropdownMenuItem className="cursor-pointer text-primary">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Converter em Cliente
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: lead.id, status: "archived" })}
                              className="cursor-pointer text-gray-400"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir este lead permanentemente?")) {
                                  deleteLeadMutation.mutate(lead.id);
                                }
                              }}
                              className="cursor-pointer text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
