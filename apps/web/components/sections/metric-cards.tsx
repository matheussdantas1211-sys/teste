import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DashboardMetric } from '@/lib/types';

export function MetricCards({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {metric.label.includes('R$') ? formatCurrency(metric.value) : metric.value}
            </div>
            <p className="mt-2 text-sm text-emerald-600">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
