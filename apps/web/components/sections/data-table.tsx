import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ClientSummary, InvoiceSummary, VehicleSummary, WhatsAppLog } from '@/lib/types';

function invoiceVariant(status: InvoiceSummary['status']) {
  switch (status) {
    case 'PAGO':
      return 'success';
    case 'VENCIDO':
    case 'INADIMPLENTE':
      return 'destructive';
    case 'PENDENTE':
      return 'warning';
    default:
      return 'neutral';
  }
}

function vehicleVariant(status: VehicleSummary['status']) {
  switch (status) {
    case 'ATIVO':
      return 'success';
    case 'AVISO_BLOQUEIO':
      return 'warning';
    case 'BLOQUEADO':
      return 'destructive';
    case 'MANUTENCAO':
      return 'info';
    default:
      return 'neutral';
  }
}

export function ClientsTable({ clients }: { clients: ClientSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Cadastro, histórico financeiro e visão da frota por contratante.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Veículos</TableHead>
              <TableHead>Saldo em aberto</TableHead>
              <TableHead>Health score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.document}</TableCell>
                <TableCell>{client.whatsapp}</TableCell>
                <TableCell>{client.city}</TableCell>
                <TableCell>{client.vehicles}</TableCell>
                <TableCell>{formatCurrency(client.outstandingAmount)}</TableCell>
                <TableCell><Badge variant={client.healthScore === 'SAUDAVEL' ? 'success' : client.healthScore === 'RISCO' ? 'destructive' : 'warning'}>{client.healthScore ?? 'ATENCAO'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function VehiclesTable({ vehicles }: { vehicles: VehicleSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Veículos & Equipamentos</CardTitle>
        <CardDescription>Rastreadores, chips M2M, IMEI, ICCID e status operacional em uma única visão.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Rastreador</TableHead>
              <TableHead>Chip M2M</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.plate}</TableCell>
                <TableCell>{vehicle.brand} {vehicle.model} • {vehicle.year}</TableCell>
                <TableCell>{vehicle.customer}</TableCell>
                <TableCell>{vehicle.trackerModel} • {vehicle.trackerImei}</TableCell>
                <TableCell>{vehicle.chipCarrier} • {vehicle.chipIccid}</TableCell>
                <TableCell><Badge variant={vehicleVariant(vehicle.status)}>{vehicle.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function InvoicesTable({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturas e boletos</CardTitle>
        <CardDescription>Mensalidades recorrentes, baixa manual, webhook de liquidação e filtro rápido por atraso.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risco</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.customer}</TableCell>
                <TableCell>{invoice.vehicle}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell><Badge variant={invoiceVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
                <TableCell><Badge variant={invoice.riskBucket === 'BLOQUEIO' ? 'destructive' : invoice.riskBucket === 'COBRANCA' ? 'warning' : 'success'}>{invoice.riskBucket ?? 'NORMAL'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function WhatsAppLogsTable({ logs }: { logs: WhatsAppLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs do robô de cobrança</CardTitle>
        <CardDescription>Histórico de envios com rastreabilidade para atendimento, cobrança e auditoria.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.customer}</TableCell>
                <TableCell>{log.phone}</TableCell>
                <TableCell>{log.template}</TableCell>
                <TableCell><Badge variant={log.status === 'ENVIADO' ? 'success' : log.status === 'FALHA' ? 'destructive' : 'warning'}>{log.status}</Badge></TableCell>
                <TableCell>{formatDate(log.sentAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
