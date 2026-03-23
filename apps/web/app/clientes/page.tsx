import { AppShell } from '@/components/layout/app-shell';
import { ClientsTable, InvoicesTable } from '@/components/sections/data-table';
import { ContactsPanel, CollectionAgreementsPanel } from '@/components/sections/professional-panels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData } from '@/lib/api';

export default async function ClientesPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>CRM de clientes</CardTitle>
          <CardDescription>
            Cadastro completo com CPF/CNPJ, WhatsApp, múltiplos contatos, endereço, perfil 360°, histórico financeiro, health score e vínculo com veículos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Funções incluídas</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Pipeline comercial para novos contratos B2B.</li>
                <li>Contatos financeiro, operação e diretoria por cliente.</li>
                <li>Timeline operacional com notas, cobrança e risco de churn.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm text-slate-500">Perfil do cliente</p>
              <p className="mt-2 text-sm text-slate-700">
                Cada cadastro pode consolidar veículos, contratos ativos, faturamento acumulado, inadimplência, tickets, ordens de serviço, contatos críticos e acordos de renegociação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <ContactsPanel contacts={data.contacts} />
        <CollectionAgreementsPanel agreements={data.collectionAgreements} />
      </div>
      <ClientsTable clients={data.clients} />
      <InvoicesTable invoices={data.invoices} />
    </AppShell>
  );
}
