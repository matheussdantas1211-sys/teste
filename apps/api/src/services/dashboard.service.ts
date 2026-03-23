import { supabaseAdmin } from '../config/supabase';

export async function getDashboardOverview(tenantId: string) {
  const [clients, vehicles, invoices, logs, settings, revenue, contacts, serviceOrders, collectionAgreements, commandQueue] = await Promise.all([
    supabaseAdmin.from('clients_financial_summary').select('*').eq('tenant_id', tenantId).order('name').limit(10),
    supabaseAdmin.from('vehicles_with_assets').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('invoices_overview').select('*').eq('tenant_id', tenantId).order('due_date', { ascending: false }).limit(20),
    supabaseAdmin.from('whatsapp_logs').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('tenant_settings').select('*').eq('tenant_id', tenantId).single(),
    supabaseAdmin.rpc('dashboard_revenue_last_six_months', { input_tenant_id: tenantId }),
    supabaseAdmin.from('client_contacts_overview').select('*').eq('tenant_id', tenantId).order('is_primary', { ascending: false }).limit(10),
    supabaseAdmin.from('service_orders_overview').select('*').eq('tenant_id', tenantId).order('scheduled_for').limit(10),
    supabaseAdmin.from('collection_agreements_overview').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('command_queue_overview').select('*').eq('tenant_id', tenantId).order('requested_at', { ascending: false }).limit(10)
  ]);

  const invoiceRows = invoices.data ?? [];
  const overdueAmount = invoiceRows
    .filter((invoice) => ['VENCIDO', 'INADIMPLENTE'].includes(invoice.status))
    .reduce((total, invoice) => total + Number(invoice.amount) + Number(invoice.late_fee_applied ?? 0), 0);

  const receivableAmount = invoiceRows
    .filter((invoice) => ['PENDENTE', 'VENCIDO', 'INADIMPLENTE'].includes(invoice.status))
    .reduce((total, invoice) => total + Number(invoice.amount) + Number(invoice.late_fee_applied ?? 0), 0);

  return {
    metrics: [
      { label: 'Total de Clientes', value: clients.data?.length ?? 0, helper: 'Base ativa do tenant' },
      { label: 'Veículos Ativos', value: (vehicles.data ?? []).filter((item) => item.status === 'ATIVO').length, helper: 'Frota operacional' },
      { label: 'Faturas Vencidas (R$)', value: overdueAmount, helper: 'Cobrança imediata' },
      { label: 'Faturas a Receber (R$)', value: receivableAmount, helper: 'Carteira em aberto' }
    ],
    revenue: revenue.data ?? [],
    clients: (clients.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      document: item.document_number,
      whatsapp: item.whatsapp,
      city: `${item.city}/${item.state}`,
      vehicles: item.vehicle_count ?? 0,
      outstandingAmount: Number(item.outstanding_amount ?? 0),
      healthScore: item.health_score
    })),
    vehicles: (vehicles.data ?? []).map((item) => ({
      id: item.id,
      plate: item.plate,
      brand: item.brand,
      model: item.model,
      color: item.color,
      year: item.year,
      trackerModel: item.tracker_model,
      trackerImei: item.tracker_imei,
      chipCarrier: item.chip_carrier,
      chipIccid: item.chip_iccid,
      status: item.status,
      customer: item.customer
    })),
    invoices: invoiceRows.map((item) => ({
      id: item.id,
      customer: item.customer,
      vehicle: item.vehicle,
      dueDate: item.due_date,
      amount: Number(item.amount),
      status: item.status,
      paymentMethod: item.payment_method,
      lateFeeApplied: Number(item.late_fee_applied ?? 0),
      riskBucket: item.risk_bucket
    })),
    whatsappLogs: (logs.data ?? []).map((item) => ({
      id: item.id,
      customer: item.customer_name,
      phone: item.phone,
      template: item.template_name,
      status: item.status,
      sentAt: item.created_at
    })),
    settings: settings.data
      ? {
          companyName: settings.data.company_name,
          cnpj: settings.data.cnpj,
          pixKey: settings.data.pix_key,
          reminderDaysBefore: settings.data.reminder_days_before,
          reminderOnDueDate: settings.data.reminder_on_due_date,
          overdueDaysToWarn: settings.data.overdue_days_to_warn,
          overdueDaysToBlock: settings.data.overdue_days_to_block,
          gracePeriodDays: settings.data.grace_period_days,
          lateFeePercent: Number(settings.data.late_fee_percent),
          dailyInterestPercent: Number(settings.data.daily_interest_percent),
          reactivationFee: Number(settings.data.reactivation_fee_amount),
          allowPartialPayments: settings.data.allow_partial_payments,
          skipWeekendCharges: settings.data.skip_weekend_charges,
          autoCreateServiceOrderOnMaintenance: settings.data.auto_create_service_order_on_maintenance
        }
      : null,
    contacts: (contacts.data ?? []).map((item) => ({
      id: item.id,
      clientName: item.client_name,
      name: item.name,
      role: item.role,
      phone: item.phone,
      email: item.email,
      isFinancialContact: item.is_financial_contact
    })),
    serviceOrders: (serviceOrders.data ?? []).map((item) => ({
      id: item.id,
      vehicle: item.vehicle,
      customer: item.customer,
      type: item.type,
      technician: item.technician_name,
      scheduledFor: item.scheduled_for,
      status: item.status
    })),
    collectionAgreements: (collectionAgreements.data ?? []).map((item) => ({
      id: item.id,
      customer: item.client_name,
      originalAmount: Number(item.original_amount),
      negotiatedAmount: Number(item.negotiated_amount),
      entryAmount: Number(item.entry_amount),
      installments: item.installments,
      nextDueDate: item.next_due_date,
      status: item.status
    })),
    commandQueue: (commandQueue.data ?? []).map((item) => ({
      id: item.id,
      vehicle: item.vehicle,
      command: item.command_type,
      status: item.status,
      requestedAt: item.requested_at
    }))
  };
}
