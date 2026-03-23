import { AppShell } from '@/components/layout/app-shell';
import { InvoicesTable } from '@/components/sections/data-table';
import { CollectionAgreementsPanel } from '@/components/sections/professional-panels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default async function FinanceiroPage() {
  const data = await getDashboardData();
  const overdue = data.invoices.filter((invoice) => invoice.status === 'VENCIDO' || invoice.status === 'INADIMPLENTE');
  const overdueTotal = overdue.reduce((total, invoice) => total + invoice.amount + (invoice.lateFeeApplied ?? 0), 0);

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Gestão financeira profissional</CardTitle>
            <CardDescription>
              Recorrência por veículo, reajuste anual, multa, juros, carência, cobrança em dias úteis, baixa manual, webhook, acordos e reativação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-rose-50 p-5">
              <p className="text-sm font-medium text-rose-700">Filtro rápido: apenas faturas vencidas</p>
              <p className="mt-2 text-3xl font-bold text-rose-900">{formatCurrency(overdueTotal)}</p>
              <p className="mt-1 text-sm text-rose-700">{overdue.length} títulos exigindo ação de cobrança.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Regras de negócio evoluídas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="info">Carência configurável</Badge>
                  <Badge variant="success">Pagamento parcial</Badge>
                  <Badge variant="warning">Multa + juros</Badge>
                  <Badge variant="destructive">Reativação com taxa</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Práticas de SaaS maduros</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="info">Dunning inteligente</Badge>
                  <Badge variant="success">Régua por segmentação</Badge>
                  <Badge variant="warning">Renegociação assistida</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Nova recorrência</Button>
              <Button variant="outline">Importar retorno bancário</Button>
              <Button variant="secondary">Dar baixa manual</Button>
            </div>
          </CardContent>
        </Card>
        <InvoicesTable invoices={data.invoices} />
      </div>
      <CollectionAgreementsPanel agreements={data.collectionAgreements} />
    </AppShell>
  );
}
