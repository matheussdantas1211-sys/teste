import { AppShell } from '@/components/layout/app-shell';
import { VehiclesTable } from '@/components/sections/data-table';
import { CommandQueuePanel, ServiceOrdersPanel } from '@/components/sections/professional-panels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData } from '@/lib/api';

export default async function VeiculosPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Frota, equipamentos e operação técnica</CardTitle>
          <CardDescription>
            Cadastro de placa, marca, modelo, cor, ano, IMEI, ICCID, operadora, linha M2M, manutenção, comandos remotos e ordens de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              'Checklist de instalação e retirada',
              'Controle de estoque mínimo por modelo de rastreador',
              'Histórico de troca de chip e equipamento',
              'Comandos de bloqueio, desbloqueio e reinício em fila auditável'
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <ServiceOrdersPanel serviceOrders={data.serviceOrders} />
        <CommandQueuePanel items={data.commandQueue} />
      </div>
      <VehiclesTable vehicles={data.vehicles} />
    </AppShell>
  );
}
