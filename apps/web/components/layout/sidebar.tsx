import Link from 'next/link';
import { BarChart3, Car, CreditCard, LayoutDashboard, MessageSquareText, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/veiculos', label: 'Veículos', icon: Car },
  { href: '/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageSquareText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings }
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 px-5 py-8 text-white lg:flex">
      <div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
          <div className="rounded-2xl bg-brand-500 p-3">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-300">SaaS B2B</p>
            <h1 className="text-lg font-semibold">Rota Segura</h1>
          </div>
        </div>
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white',
                active && 'bg-brand-500 text-white shadow-lg shadow-brand-900/30'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Motor de cobrança ativo</p>
        <p className="mt-1">Processos diários às 08:00 UTC com WhatsApp, PIX e bloqueio automático.</p>
      </div>
    </aside>
  );
}
