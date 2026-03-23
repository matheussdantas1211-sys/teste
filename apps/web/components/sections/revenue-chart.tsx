import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenuePoint } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento dos últimos 6 meses</CardTitle>
        <CardDescription>Visão rápida para acompanhar expansão de carteira e previsibilidade de caixa.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-6">
          {points.map((point) => (
            <div key={point.month} className="flex flex-col items-center gap-3">
              <div className="flex h-56 w-full items-end rounded-2xl bg-slate-100 p-3">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${(point.value / max) * 100}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">{point.month}</p>
                <p className="text-xs text-slate-500">{formatCurrency(point.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
