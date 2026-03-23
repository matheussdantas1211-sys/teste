import { AppShell } from '@/components/layout/app-shell';
import { SettingsPanel } from '@/components/sections/settings-panel';
import { getDashboardData } from '@/lib/api';

export default async function ConfiguracoesPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <SettingsPanel settings={data.settings} />
    </AppShell>
  );
}
