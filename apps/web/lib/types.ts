export type InvoiceStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO' | 'INADIMPLENTE';
export type VehicleStatus = 'ATIVO' | 'INATIVO' | 'MANUTENCAO' | 'BLOQUEADO' | 'AVISO_BLOQUEIO';

export interface DashboardMetric {
  label: string;
  value: number;
  helper: string;
}

export interface RevenuePoint {
  month: string;
  value: number;
}

export interface ClientSummary {
  id: string;
  name: string;
  document: string;
  whatsapp: string;
  city: string;
  vehicles: number;
  outstandingAmount: number;
  healthScore?: 'SAUDAVEL' | 'ATENCAO' | 'RISCO';
}

export interface VehicleSummary {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  trackerModel: string;
  trackerImei: string;
  chipCarrier: string;
  chipIccid: string;
  status: VehicleStatus;
  customer: string;
}

export interface InvoiceSummary {
  id: string;
  customer: string;
  vehicle: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: 'BOLETO' | 'PIX' | 'MANUAL';
  lateFeeApplied?: number;
  riskBucket?: 'NORMAL' | 'COBRANCA' | 'BLOQUEIO';
}

export interface WhatsAppLog {
  id: string;
  customer: string;
  phone: string;
  template: string;
  status: 'ENVIADO' | 'FALHA' | 'PENDENTE';
  sentAt: string;
}

export interface CompanySettings {
  companyName: string;
  cnpj: string;
  pixKey: string;
  reminderDaysBefore: number;
  reminderOnDueDate: boolean;
  overdueDaysToWarn: number;
  overdueDaysToBlock: number;
  gracePeriodDays: number;
  lateFeePercent: number;
  dailyInterestPercent: number;
  reactivationFee: number;
  allowPartialPayments: boolean;
  skipWeekendCharges: boolean;
  autoCreateServiceOrderOnMaintenance: boolean;
}

export interface ClientContact {
  id: string;
  clientName: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isFinancialContact: boolean;
}

export interface ServiceOrder {
  id: string;
  vehicle: string;
  customer: string;
  type: 'INSTALACAO' | 'MANUTENCAO' | 'RETIRADA' | 'SUPORTE_CAMPO';
  technician: string;
  scheduledFor: string;
  status: 'ABERTA' | 'AGENDADA' | 'EM_EXECUCAO' | 'CONCLUIDA';
}

export interface CollectionAgreement {
  id: string;
  customer: string;
  originalAmount: number;
  negotiatedAmount: number;
  entryAmount: number;
  installments: number;
  nextDueDate: string;
  status: 'PROPOSTA' | 'ATIVA' | 'ATRASADA' | 'CONCLUIDA';
}

export interface CommandQueueItem {
  id: string;
  vehicle: string;
  command: 'BLOQUEAR' | 'DESBLOQUEAR' | 'REINICIAR_RASTREADOR';
  status: 'PENDENTE' | 'PROCESSANDO' | 'SUCESSO' | 'FALHA';
  requestedAt: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  revenue: RevenuePoint[];
  clients: ClientSummary[];
  vehicles: VehicleSummary[];
  invoices: InvoiceSummary[];
  whatsappLogs: WhatsAppLog[];
  settings: CompanySettings;
  contacts: ClientContact[];
  serviceOrders: ServiceOrder[];
  collectionAgreements: CollectionAgreement[];
  commandQueue: CommandQueueItem[];
}
