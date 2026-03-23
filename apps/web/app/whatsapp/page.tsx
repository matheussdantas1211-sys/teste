import { AppShell } from '@/components/layout/app-shell';
import { WhatsAppLogsTable } from '@/components/sections/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData } from '@/lib/api';

export default async function WhatsAppPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Automação WhatsApp via Baileys</CardTitle>
            <CardDescription>
              QR Code de pareamento, status da sessão, templates de cobrança e observabilidade dos disparos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm text-slate-500">Status da conexão</p>
                <p className="mt-2 text-xl font-bold text-slate-900">Desconectado</p>
              </div>
              <Badge variant="destructive">Requer novo QR Code</Badge>
            </div>
            <div className="flex aspect-square items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">
              QR Code aparecerá aqui quando a API iniciar a sessão Baileys.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Gerar QR Code</Button>
              <Button variant="outline">Reiniciar sessão</Button>
              <Button variant="secondary">Enviar mensagem teste</Button>
            </div>
          </CardContent>
        </Card>
        <WhatsAppLogsTable logs={data.whatsappLogs} />
      </div>
    </AppShell>
  );
}
