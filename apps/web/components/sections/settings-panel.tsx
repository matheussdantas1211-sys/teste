import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanySettings } from '@/lib/types';

function SettingField({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{String(value)}</p>
    </div>
  );
}

export function SettingsPanel({ settings }: { settings: CompanySettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da empresa</CardTitle>
        <CardDescription>Regras de cobrança, chave PIX, identidade visual, compliance financeiro e automações operacionais por tenant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SettingField label="Empresa" value={settings.companyName} />
          <SettingField label="CNPJ" value={settings.cnpj} />
          <SettingField label="Chave PIX" value={settings.pixKey} />
          <SettingField label="Lembrar D-3" value={`${settings.reminderDaysBefore} dias antes`} />
          <SettingField label="Cobrança no vencimento" value={settings.reminderOnDueDate ? 'Ativada' : 'Desativada'} />
          <SettingField label="Aviso de bloqueio" value={`${settings.overdueDaysToWarn} dia após atraso`} />
          <SettingField label="Bloqueio efetivo" value={`${settings.overdueDaysToBlock} dias após atraso`} />
          <SettingField label="Carência" value={`${settings.gracePeriodDays} dias`} />
          <SettingField label="Multa" value={`${settings.lateFeePercent}%`} />
          <SettingField label="Juros diário" value={`${settings.dailyInterestPercent}%`} />
          <SettingField label="Taxa de reativação" value={`R$ ${settings.reactivationFee}`} />
          <SettingField label="Pagamento parcial" value={settings.allowPartialPayments ? 'Permitido' : 'Bloqueado'} />
          <SettingField label="Pular fins de semana" value={settings.skipWeekendCharges ? 'Sim' : 'Não'} />
          <SettingField label="OS automática em manutenção" value={settings.autoCreateServiceOrderOnMaintenance ? 'Sim' : 'Não'} />
          <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50 p-4 xl:col-span-2">
            <p className="text-sm font-semibold text-brand-900">Funções extras pensadas como SaaS profissional</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-brand-800">
              <li>Perfis de acesso por função e trilha de auditoria.</li>
              <li>Acordos de renegociação e cobrança escalonada.</li>
              <li>Fila de comandos remotos e ordens de serviço.</li>
              <li>Health score por cliente para prevenção de churn.</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Salvar configurações</Button>
          <Button variant="outline">Testar mensagem WhatsApp</Button>
          <Button variant="secondary">Simular motor de cobrança</Button>
        </div>
      </CardContent>
    </Card>
  );
}
