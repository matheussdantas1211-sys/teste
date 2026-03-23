import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';

const clientSchema = z.object({
  name: z.string().min(3),
  documentType: z.enum(['CPF', 'CNPJ']),
  documentNumber: z.string().min(11),
  whatsapp: z.string().min(10),
  email: z.string().email().optional(),
  zipCode: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  notes: z.string().optional()
});

const contactSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(3),
  role: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  isFinancialContact: z.boolean().default(false),
  isPrimary: z.boolean().default(false)
});

const vehicleSchema = z.object({
  clientId: z.string().uuid(),
  plate: z.string().min(7),
  brand: z.string().min(2),
  model: z.string().min(2),
  color: z.string().min(2),
  year: z.number().min(1990),
  trackerModel: z.string().min(2),
  trackerImei: z.string().min(10),
  chipCarrier: z.string().min(2),
  chipIccid: z.string().min(10),
  lineNumber: z.string().min(8),
  status: z.enum(['ATIVO', 'INATIVO', 'MANUTENCAO', 'BLOQUEADO', 'AVISO_BLOQUEIO'])
});

const serviceOrderSchema = z.object({
  vehicleId: z.string().uuid(),
  clientId: z.string().uuid(),
  type: z.enum(['INSTALACAO', 'MANUTENCAO', 'RETIRADA', 'SUPORTE_CAMPO']),
  technicianName: z.string().min(3),
  scheduledFor: z.string().datetime(),
  notes: z.string().optional()
});

const contractSchema = z.object({
  clientId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  monthlyAmount: z.number().positive(),
  billingDay: z.number().min(1).max(28),
  startsAt: z.string().date(),
  paymentMethod: z.enum(['BOLETO', 'PIX', 'MANUAL']),
  notes: z.string().optional()
});

const agreementSchema = z.object({
  clientId: z.string().uuid(),
  originalAmount: z.number().positive(),
  negotiatedAmount: z.number().positive(),
  entryAmount: z.number().min(0),
  installments: z.number().min(1).max(24),
  nextDueDate: z.string().date(),
  notes: z.string().optional()
});

const commandQueueSchema = z.object({
  vehicleId: z.string().uuid(),
  commandType: z.enum(['BLOQUEAR', 'DESBLOQUEAR', 'REINICIAR_RASTREADOR']),
  reason: z.string().min(3)
});

const settingsSchema = z.object({
  companyName: z.string().min(3),
  cnpj: z.string().min(14),
  pixKey: z.string().min(3),
  logoUrl: z.string().url().optional().or(z.literal('')),
  reminderDaysBefore: z.number().min(1).max(30),
  reminderOnDueDate: z.boolean(),
  overdueDaysToWarn: z.number().min(1).max(30),
  overdueDaysToBlock: z.number().min(1).max(60),
  gracePeriodDays: z.number().min(0).max(15),
  lateFeePercent: z.number().min(0).max(30),
  dailyInterestPercent: z.number().min(0).max(5),
  reactivationFee: z.number().min(0).max(500),
  allowPartialPayments: z.boolean(),
  skipWeekendCharges: z.boolean(),
  autoCreateServiceOrderOnMaintenance: z.boolean()
});

export async function listClients(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('clients_financial_summary').select('*').eq('tenant_id', tenantId).order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createClient(tenantId: string, payload: unknown) {
  const data = clientSchema.parse(payload);
  const { data: created, error } = await supabaseAdmin.from('clients').insert({
    tenant_id: tenantId,
    name: data.name,
    document_type: data.documentType,
    document_number: data.documentNumber,
    whatsapp: data.whatsapp,
    email: data.email ?? null,
    zip_code: data.zipCode,
    street: data.street,
    number: data.number,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    notes: data.notes ?? null
  }).select('*').single();
  if (error) throw new Error(error.message);
  return created;
}

export async function listClientContacts(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('client_contacts_overview').select('*').eq('tenant_id', tenantId).order('is_primary', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createClientContact(tenantId: string, payload: unknown) {
  const data = contactSchema.parse(payload);
  const { data: created, error } = await supabaseAdmin.from('client_contacts').insert({
    tenant_id: tenantId,
    client_id: data.clientId,
    name: data.name,
    role: data.role,
    phone: data.phone,
    email: data.email,
    is_financial_contact: data.isFinancialContact,
    is_primary: data.isPrimary
  }).select('*').single();
  if (error) throw new Error(error.message);
  return created;
}

export async function listVehicles(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('vehicles_with_assets').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createVehicle(tenantId: string, payload: unknown) {
  const data = vehicleSchema.parse(payload);
  const trackerInsert = await supabaseAdmin.from('trackers').insert({
    tenant_id: tenantId,
    imei: data.trackerImei,
    model: data.trackerModel,
    status: 'EM_USO'
  }).select('id').single();
  if (trackerInsert.error) throw new Error(trackerInsert.error.message);

  const chipInsert = await supabaseAdmin.from('m2m_chips').insert({
    tenant_id: tenantId,
    iccid: data.chipIccid,
    carrier: data.chipCarrier,
    line_number: data.lineNumber,
    status: 'EM_USO'
  }).select('id').single();
  if (chipInsert.error) throw new Error(chipInsert.error.message);

  const { data: vehicle, error } = await supabaseAdmin.from('vehicles').insert({
    tenant_id: tenantId,
    client_id: data.clientId,
    plate: data.plate,
    brand: data.brand,
    model: data.model,
    color: data.color,
    year: data.year,
    tracker_id: trackerInsert.data.id,
    chip_id: chipInsert.data.id,
    status: data.status
  }).select('*').single();
  if (error) throw new Error(error.message);
  return vehicle;
}

export async function listServiceOrders(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('service_orders_overview').select('*').eq('tenant_id', tenantId).order('scheduled_for');
  if (error) throw new Error(error.message);
  return data;
}

export async function createServiceOrder(tenantId: string, payload: unknown) {
  const data = serviceOrderSchema.parse(payload);
  const { data: created, error } = await supabaseAdmin.from('service_orders').insert({
    tenant_id: tenantId,
    vehicle_id: data.vehicleId,
    client_id: data.clientId,
    type: data.type,
    technician_name: data.technicianName,
    scheduled_for: data.scheduledFor,
    notes: data.notes ?? null,
    status: 'AGENDADA'
  }).select('*').single();
  if (error) throw new Error(error.message);
  return created;
}

export async function listContracts(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('contracts').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createContract(tenantId: string, payload: unknown) {
  const data = contractSchema.parse(payload);
  const { data: contract, error } = await supabaseAdmin.from('contracts').insert({
    tenant_id: tenantId,
    client_id: data.clientId,
    vehicle_id: data.vehicleId,
    monthly_amount: data.monthlyAmount,
    billing_day: data.billingDay,
    starts_at: data.startsAt,
    payment_method: data.paymentMethod,
    notes: data.notes ?? null,
    status: 'ATIVO'
  }).select('*').single();
  if (error) throw new Error(error.message);
  return contract;
}

export async function listInvoices(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('invoices_overview').select('*').eq('tenant_id', tenantId).order('due_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function listCollectionAgreements(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('collection_agreements_overview').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCollectionAgreement(tenantId: string, userId: string, payload: unknown) {
  const data = agreementSchema.parse(payload);
  const { error } = await supabaseAdmin.rpc('open_collection_agreement', {
    input_tenant_id: tenantId,
    input_user_id: userId,
    input_client_id: data.clientId,
    input_original_amount: data.originalAmount,
    input_negotiated_amount: data.negotiatedAmount,
    input_entry_amount: data.entryAmount,
    input_installments: data.installments,
    input_next_due_date: data.nextDueDate,
    input_notes: data.notes ?? null
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listCommandQueue(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('command_queue_overview').select('*').eq('tenant_id', tenantId).order('requested_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function enqueueCommand(tenantId: string, userId: string, payload: unknown) {
  const data = commandQueueSchema.parse(payload);
  const { error } = await supabaseAdmin.rpc('enqueue_vehicle_command', {
    input_tenant_id: tenantId,
    input_user_id: userId,
    input_vehicle_id: data.vehicleId,
    input_command_type: data.commandType,
    input_reason: data.reason
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getSettings(tenantId: string) {
  const { data, error } = await supabaseAdmin.from('tenant_settings').select('*').eq('tenant_id', tenantId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSettings(tenantId: string, payload: unknown) {
  const data = settingsSchema.parse(payload);
  const { data: updated, error } = await supabaseAdmin.from('tenant_settings').update({
    company_name: data.companyName,
    cnpj: data.cnpj,
    pix_key: data.pixKey,
    logo_url: data.logoUrl || null,
    reminder_days_before: data.reminderDaysBefore,
    reminder_on_due_date: data.reminderOnDueDate,
    overdue_days_to_warn: data.overdueDaysToWarn,
    overdue_days_to_block: data.overdueDaysToBlock,
    grace_period_days: data.gracePeriodDays,
    late_fee_percent: data.lateFeePercent,
    daily_interest_percent: data.dailyInterestPercent,
    reactivation_fee_amount: data.reactivationFee,
    allow_partial_payments: data.allowPartialPayments,
    skip_weekend_charges: data.skipWeekendCharges,
    auto_create_service_order_on_maintenance: data.autoCreateServiceOrderOnMaintenance
  }).eq('tenant_id', tenantId).select('*').single();
  if (error) throw new Error(error.message);
  return updated;
}
