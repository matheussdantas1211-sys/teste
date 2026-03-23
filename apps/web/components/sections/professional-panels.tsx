import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientContact, CollectionAgreement, CommandQueueItem, ServiceOrder } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

function statusVariant(status: string) {
  if (['CONCLUIDA', 'SUCESSO', 'ATIVA', 'SAUDAVEL'].includes(status)) return 'success';
  if (['PENDENTE', 'AGENDADA', 'PROPOSTA', 'ATENCAO', 'PROCESSANDO'].includes(status)) return 'warning';
  if (['ATRASADA', 'FALHA', 'RISCO'].includes(status)) return 'destructive';
  return 'info';
}

export function ContactsPanel({ contacts }: { contacts: ClientContact[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos secundários e decisores</CardTitle>
        <CardDescription>Capacidade comum em CRMs profissionais para cobrar financeiro, operação e diretoria sem perder contexto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{contact.name}</p>
                <p className="text-sm text-slate-500">{contact.clientName} • {contact.role}</p>
              </div>
              <Badge variant={contact.isFinancialContact ? 'success' : 'info'}>
                {contact.isFinancialContact ? 'Financeiro' : 'Operacional'}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-slate-700">
              <p>{contact.phone}</p>
              <p>{contact.email}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ServiceOrdersPanel({ serviceOrders }: { serviceOrders: ServiceOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens de serviço</CardTitle>
        <CardDescription>Gestão de instalação, manutenção, retirada e suporte em campo para reduzir churn e melhorar SLA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {serviceOrders.map((order) => (
          <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{order.vehicle} • {order.customer}</p>
                <p className="text-sm text-slate-500">{order.type} • Técnico: {order.technician}</p>
              </div>
              <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-700">Agendado para {formatDate(order.scheduledFor)}.</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CollectionAgreementsPanel({ agreements }: { agreements: CollectionAgreement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Renegociação e acordos</CardTitle>
        <CardDescription>Recurso essencial para SaaS maduros: acordo, entrada, parcelamento e acompanhamento do próximo vencimento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {agreements.map((agreement) => (
          <div key={agreement.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{agreement.customer}</p>
                <p className="text-sm text-slate-500">Próximo vencimento: {formatDate(agreement.nextDueDate)}</p>
              </div>
              <Badge variant={statusVariant(agreement.status)}>{agreement.status}</Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Original</p>
                <p className="font-semibold text-slate-900">{formatCurrency(agreement.originalAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Negociado</p>
                <p className="font-semibold text-slate-900">{formatCurrency(agreement.negotiatedAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Entrada</p>
                <p className="font-semibold text-slate-900">{formatCurrency(agreement.entryAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Parcelas</p>
                <p className="font-semibold text-slate-900">{agreement.installments}x</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CommandQueuePanel({ items }: { items: CommandQueueItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fila de comandos remotos</CardTitle>
        <CardDescription>Fila auditável para bloqueio, desbloqueio e reinício de rastreadores, comum em operações NOC e antifraude.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.vehicle}</p>
                <p className="text-sm text-slate-500">{item.command} • solicitado em {formatDate(item.requestedAt)}</p>
              </div>
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
