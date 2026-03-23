import { BellRing, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-brand-700">Operação de rastreamento veicular</p>
        <h2 className="text-2xl font-bold text-slate-900">Painel executivo multi-tenant</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          Buscar cliente, placa, IMEI ou fatura...
        </div>
        <button className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50">
          <BellRing className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
