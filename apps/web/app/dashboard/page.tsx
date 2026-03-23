import { AppShell } from '@/components/layout/app-shell';
import { MetricCards } from '@/components/sections/metric-cards';
import { RevenueChart } from '@/components/sections/revenue-chart';
import { ClientsTable, InvoicesTable } from '@/components/sections/data-table';
import { CollectionAgreementsPanel, CommandQueuePanel, ServiceOrdersPanel } from '@/components/sections/professional-panels';
import { getDashboardData } from '@/lib/api';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <MetricCards metrics={data.metrics} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <RevenueChart points={data.revenue} />
        <InvoicesTable invoices={data.invoices} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <ServiceOrdersPanel serviceOrders={data.serviceOrders} />
        <CollectionAgreementsPanel agreements={data.collectionAgreements} />
        <CommandQueuePanel items={data.commandQueue} />
      </div>
      <ClientsTable clients={data.clients} />
    </AppShell>
  );
}
