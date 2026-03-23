import { DashboardData } from '@/lib/types';

export const mockData: DashboardData = {
  metrics: [
    { label: 'Total de Clientes', value: 128, helper: '+12 no mês' },
    { label: 'Veículos Ativos', value: 412, helper: '96,5% da base' },
    { label: 'Faturas Vencidas (R$)', value: 18490.35, helper: '23 títulos em aberto' },
    { label: 'Faturas a Receber (R$)', value: 91230.1, helper: 'Próximos 30 dias' }
  ],
  revenue: [
    { month: 'Out', value: 55200 },
    { month: 'Nov', value: 58010 },
    { month: 'Dez', value: 60110 },
    { month: 'Jan', value: 62340 },
    { month: 'Fev', value: 65580 },
    { month: 'Mar', value: 70120 }
  ],
  clients: [
    {
      id: 'cli_1',
      name: 'Transportes Atlas Ltda',
      document: '12.345.678/0001-90',
      whatsapp: '+55 11 98888-0001',
      city: 'São Paulo/SP',
      vehicles: 42,
      outstandingAmount: 4590.4,
      healthScore: 'ATENCAO'
    },
    {
      id: 'cli_2',
      name: 'Construtora Horizonte',
      document: '55.612.457/0001-70',
      whatsapp: '+55 31 97777-9000',
      city: 'Belo Horizonte/MG',
      vehicles: 18,
      outstandingAmount: 1399.8,
      healthScore: 'RISCO'
    },
    {
      id: 'cli_3',
      name: 'Logística Prime',
      document: '024.987.150-08',
      whatsapp: '+55 21 96666-1234',
      city: 'Rio de Janeiro/RJ',
      vehicles: 9,
      outstandingAmount: 0,
      healthScore: 'SAUDAVEL'
    }
  ],
  vehicles: [
    {
      id: 'veh_1',
      plate: 'BRA2E19',
      brand: 'Volkswagen',
      model: 'Delivery 11.180',
      color: 'Branco',
      year: 2022,
      trackerModel: 'Teltonika FMC920',
      trackerImei: '356938035643809',
      chipCarrier: 'Claro M2M',
      chipIccid: '8955000000000012345',
      status: 'ATIVO',
      customer: 'Transportes Atlas Ltda'
    },
    {
      id: 'veh_2',
      plate: 'QXP0A44',
      brand: 'Fiat',
      model: 'Strada',
      color: 'Prata',
      year: 2023,
      trackerModel: 'Queclink GV57',
      trackerImei: '356938035643801',
      chipCarrier: 'Vivo M2M',
      chipIccid: '8955000000000067890',
      status: 'AVISO_BLOQUEIO',
      customer: 'Construtora Horizonte'
    },
    {
      id: 'veh_3',
      plate: 'RDI7C81',
      brand: 'Toyota',
      model: 'Hilux',
      color: 'Preto',
      year: 2021,
      trackerModel: 'Suntech ST4330',
      trackerImei: '356938035643800',
      chipCarrier: 'TIM M2M',
      chipIccid: '8955000000000088888',
      status: 'MANUTENCAO',
      customer: 'Logística Prime'
    }
  ],
  invoices: [
    {
      id: 'inv_1',
      customer: 'Transportes Atlas Ltda',
      vehicle: 'BRA2E19',
      dueDate: '2026-03-26',
      amount: 69.9,
      status: 'PENDENTE',
      paymentMethod: 'PIX',
      lateFeeApplied: 0,
      riskBucket: 'NORMAL'
    },
    {
      id: 'inv_2',
      customer: 'Construtora Horizonte',
      vehicle: 'QXP0A44',
      dueDate: '2026-03-22',
      amount: 89.9,
      status: 'VENCIDO',
      paymentMethod: 'BOLETO',
      lateFeeApplied: 4.5,
      riskBucket: 'COBRANCA'
    },
    {
      id: 'inv_3',
      customer: 'Logística Prime',
      vehicle: 'RDI7C81',
      dueDate: '2026-03-20',
      amount: 109.9,
      status: 'PAGO',
      paymentMethod: 'MANUAL',
      lateFeeApplied: 0,
      riskBucket: 'NORMAL'
    }
  ],
  whatsappLogs: [
    {
      id: 'wa_1',
      customer: 'Transportes Atlas Ltda',
      phone: '+5511988880001',
      template: 'Lembrete D-3',
      status: 'ENVIADO',
      sentAt: '2026-03-23T08:15:00.000Z'
    },
    {
      id: 'wa_2',
      customer: 'Construtora Horizonte',
      phone: '+5531977779000',
      template: 'Atraso D+1',
      status: 'ENVIADO',
      sentAt: '2026-03-23T08:40:00.000Z'
    },
    {
      id: 'wa_3',
      customer: 'Logística Prime',
      phone: '+5521966661234',
      template: 'Confirmação de pagamento',
      status: 'PENDENTE',
      sentAt: '2026-03-23T09:00:00.000Z'
    }
  ],
  settings: {
    companyName: 'Rota Segura Monitoramento',
    cnpj: '48.765.100/0001-55',
    pixKey: 'financeiro@rotasegura.com.br',
    reminderDaysBefore: 3,
    reminderOnDueDate: true,
    overdueDaysToWarn: 1,
    overdueDaysToBlock: 5,
    gracePeriodDays: 2,
    lateFeePercent: 2,
    dailyInterestPercent: 0.033,
    reactivationFee: 39.9,
    allowPartialPayments: true,
    skipWeekendCharges: true,
    autoCreateServiceOrderOnMaintenance: true
  },
  contacts: [
    {
      id: 'ct_1',
      clientName: 'Transportes Atlas Ltda',
      name: 'Mariana Freitas',
      role: 'Financeiro',
      phone: '+55 11 97777-1122',
      email: 'mariana@atlas.com.br',
      isFinancialContact: true
    },
    {
      id: 'ct_2',
      clientName: 'Construtora Horizonte',
      name: 'Felipe Rocha',
      role: 'Gestor de Frota',
      phone: '+55 31 98888-6655',
      email: 'felipe@horizonte.com.br',
      isFinancialContact: false
    }
  ],
  serviceOrders: [
    {
      id: 'so_1',
      vehicle: 'BRA2E19',
      customer: 'Transportes Atlas Ltda',
      type: 'MANUTENCAO',
      technician: 'Carlos Silva',
      scheduledFor: '2026-03-25T13:30:00.000Z',
      status: 'AGENDADA'
    },
    {
      id: 'so_2',
      vehicle: 'RDI7C81',
      customer: 'Logística Prime',
      type: 'SUPORTE_CAMPO',
      technician: 'Equipe Externa',
      scheduledFor: '2026-03-24T09:00:00.000Z',
      status: 'EM_EXECUCAO'
    }
  ],
  collectionAgreements: [
    {
      id: 'ag_1',
      customer: 'Construtora Horizonte',
      originalAmount: 1899.8,
      negotiatedAmount: 1650,
      entryAmount: 450,
      installments: 3,
      nextDueDate: '2026-03-28',
      status: 'ATIVA'
    }
  ],
  commandQueue: [
    {
      id: 'cmd_1',
      vehicle: 'QXP0A44',
      command: 'BLOQUEAR',
      status: 'PENDENTE',
      requestedAt: '2026-03-23T08:41:00.000Z'
    },
    {
      id: 'cmd_2',
      vehicle: 'BRA2E19',
      command: 'REINICIAR_RASTREADOR',
      status: 'SUCESSO',
      requestedAt: '2026-03-23T07:15:00.000Z'
    }
  ]
};
