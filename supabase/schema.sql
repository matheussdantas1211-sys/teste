create extension if not exists "pgcrypto";

create type public.user_role as enum ('OWNER', 'ADMIN', 'FINANCEIRO', 'OPERADOR', 'SUPORTE');
create type public.vehicle_status as enum ('ATIVO', 'INATIVO', 'MANUTENCAO', 'AVISO_BLOQUEIO', 'BLOQUEADO');
create type public.asset_status as enum ('ESTOQUE', 'EM_USO', 'MANUTENCAO', 'DESCARTE');
create type public.contract_status as enum ('ATIVO', 'PAUSADO', 'CANCELADO');
create type public.invoice_status as enum ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO', 'INADIMPLENTE');
create type public.payment_method as enum ('BOLETO', 'PIX', 'MANUAL');
create type public.document_type as enum ('CPF', 'CNPJ');
create type public.ticket_status as enum ('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'CANCELADO');
create type public.service_order_type as enum ('INSTALACAO', 'MANUTENCAO', 'RETIRADA', 'SUPORTE_CAMPO');
create type public.service_order_status as enum ('ABERTA', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA');
create type public.command_type as enum ('BLOQUEAR', 'DESBLOQUEAR', 'REINICIAR_RASTREADOR');
create type public.command_status as enum ('PENDENTE', 'PROCESSANDO', 'SUCESSO', 'FALHA');
create type public.collection_status as enum ('PROPOSTA', 'ATIVA', 'ATRASADA', 'CONCLUIDA', 'CANCELADA');
create type public.health_score as enum ('SAUDAVEL', 'ATENCAO', 'RISCO');

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  cnpj text not null unique,
  email text,
  phone text,
  status text not null default 'ATIVO',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'OPERADOR',
  whatsapp text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  company_name text not null,
  cnpj text not null,
  logo_url text,
  pix_key text not null,
  boleto_instructions text,
  reminder_days_before integer not null default 3,
  reminder_on_due_date boolean not null default true,
  overdue_days_to_warn integer not null default 1,
  overdue_days_to_block integer not null default 5,
  grace_period_days integer not null default 2,
  late_fee_percent numeric(6,3) not null default 2,
  daily_interest_percent numeric(6,3) not null default 0.033,
  reactivation_fee_amount numeric(12,2) not null default 39.90,
  allow_partial_payments boolean not null default true,
  skip_weekend_charges boolean not null default true,
  auto_create_service_order_on_maintenance boolean not null default true,
  block_message_template text not null default 'Seu veículo será bloqueado por inadimplência caso a regularização não ocorra.',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  document_type public.document_type not null,
  document_number text not null,
  whatsapp text not null,
  phone text,
  email text,
  zip_code text,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  complement text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, document_number)
);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  role text not null,
  phone text not null,
  email text not null,
  is_financial_contact boolean not null default false,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trackers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  imei text not null,
  model text not null,
  manufacturer text,
  firmware_version text,
  serial_number text,
  status public.asset_status not null default 'ESTOQUE',
  last_installation_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, imei)
);

create table if not exists public.m2m_chips (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  iccid text not null,
  carrier text not null,
  line_number text not null,
  apn text,
  status public.asset_status not null default 'ESTOQUE',
  activated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, iccid)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  tracker_id uuid references public.trackers(id) on delete set null,
  chip_id uuid references public.m2m_chips(id) on delete set null,
  plate text not null,
  brand text not null,
  model text not null,
  color text,
  year integer,
  renavam text,
  chassis text,
  installation_date date,
  status public.vehicle_status not null default 'ATIVO',
  blocked_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, plate)
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type public.service_order_type not null,
  status public.service_order_status not null default 'ABERTA',
  technician_name text,
  scheduled_for timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  status public.contract_status not null default 'ATIVO',
  monthly_amount numeric(12,2) not null,
  billing_day integer not null check (billing_day between 1 and 28),
  payment_method public.payment_method not null default 'PIX',
  starts_at date not null,
  ends_at date,
  readjustment_month integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reference_month date not null,
  due_date date not null,
  amount numeric(12,2) not null,
  late_fee_applied numeric(12,2) not null default 0,
  interest_applied numeric(12,2) not null default 0,
  total_amount numeric(12,2) generated always as (amount + late_fee_applied + interest_applied) stored,
  status public.invoice_status not null default 'PENDENTE',
  payment_method public.payment_method not null,
  boleto_url text,
  boleto_barcode text,
  pix_copy_paste text,
  paid_at timestamptz,
  paid_amount numeric(12,2),
  external_transaction_id text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, contract_id, reference_month)
);

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  paid_amount numeric(12,2) not null,
  paid_at timestamptz not null,
  method text not null,
  source text not null,
  transaction_id text,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.collection_agreements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  status public.collection_status not null default 'PROPOSTA',
  original_amount numeric(12,2) not null,
  negotiated_amount numeric(12,2) not null,
  entry_amount numeric(12,2) not null default 0,
  installments integer not null default 1,
  next_due_date date not null,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.command_queue (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  requested_by uuid references public.users(id) on delete set null,
  command_type public.command_type not null,
  status public.command_status not null default 'PENDENTE',
  reason text not null,
  requested_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  provider_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_sessions (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  status text not null default 'DESCONECTADO',
  last_connected_at timestamptz,
  last_qr_generated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  customer_name text not null,
  phone text not null,
  template_name text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  provider_message_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  action text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  title text not null,
  description text not null,
  status public.ticket_status not null default 'ABERTO',
  priority text not null default 'MEDIA',
  opened_by uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_clients_tenant on public.clients(tenant_id);
create index if not exists idx_contacts_tenant on public.client_contacts(tenant_id, client_id);
create index if not exists idx_vehicles_tenant_status on public.vehicles(tenant_id, status);
create index if not exists idx_service_orders_tenant_status on public.service_orders(tenant_id, status);
create index if not exists idx_contracts_tenant_status on public.contracts(tenant_id, status);
create index if not exists idx_invoices_tenant_status_due on public.invoices(tenant_id, status, due_date);
create index if not exists idx_collection_agreements_tenant_status on public.collection_agreements(tenant_id, status);
create index if not exists idx_command_queue_tenant_status on public.command_queue(tenant_id, status, requested_at desc);
create index if not exists idx_whatsapp_logs_tenant_created on public.whatsapp_logs(tenant_id, created_at desc);
create index if not exists idx_audit_logs_tenant_created on public.audit_logs(tenant_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace trigger trg_tenants_updated_at before update on public.tenants for each row execute function public.set_updated_at();
create or replace trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create or replace trigger trg_tenant_settings_updated_at before update on public.tenant_settings for each row execute function public.set_updated_at();
create or replace trigger trg_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create or replace trigger trg_client_contacts_updated_at before update on public.client_contacts for each row execute function public.set_updated_at();
create or replace trigger trg_trackers_updated_at before update on public.trackers for each row execute function public.set_updated_at();
create or replace trigger trg_chips_updated_at before update on public.m2m_chips for each row execute function public.set_updated_at();
create or replace trigger trg_vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
create or replace trigger trg_service_orders_updated_at before update on public.service_orders for each row execute function public.set_updated_at();
create or replace trigger trg_contracts_updated_at before update on public.contracts for each row execute function public.set_updated_at();
create or replace trigger trg_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create or replace trigger trg_collection_agreements_updated_at before update on public.collection_agreements for each row execute function public.set_updated_at();
create or replace trigger trg_whatsapp_sessions_updated_at before update on public.whatsapp_sessions for each row execute function public.set_updated_at();
create or replace trigger trg_support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

create or replace function public.is_weekend(input_date date)
returns boolean
language sql
stable
as $$
  select extract(isodow from input_date) in (6, 7);
$$;

create or replace function public.calculate_invoice_charges(input_invoice_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  invoice_record record;
  settings_record record;
  overdue_days integer;
  calculated_late_fee numeric(12,2);
  calculated_interest numeric(12,2);
begin
  select i.*, ts.late_fee_percent, ts.daily_interest_percent, ts.grace_period_days
    into invoice_record
  from public.invoices i
  join public.tenant_settings ts on ts.tenant_id = i.tenant_id
  where i.id = input_invoice_id;

  if invoice_record.id is null then
    raise exception 'Invoice not found';
  end if;

  overdue_days := greatest(current_date - invoice_record.due_date - invoice_record.grace_period_days, 0);
  calculated_late_fee := case when overdue_days > 0 then round(invoice_record.amount * (invoice_record.late_fee_percent / 100), 2) else 0 end;
  calculated_interest := case when overdue_days > 0 then round(invoice_record.amount * (invoice_record.daily_interest_percent / 100) * overdue_days, 2) else 0 end;

  update public.invoices
     set late_fee_applied = calculated_late_fee,
         interest_applied = calculated_interest,
         status = case when paid_at is not null then 'PAGO' when current_date > due_date then 'VENCIDO' else status end,
         updated_at = timezone('utc', now())
   where id = input_invoice_id;
end;
$$;

create or replace function public.refresh_overdue_invoice_charges(input_tenant_id uuid default null)
returns integer
language plpgsql
security definer
as $$
declare
  invoice_record record;
  processed_count integer := 0;
begin
  for invoice_record in
    select id from public.invoices
    where status in ('PENDENTE', 'VENCIDO', 'INADIMPLENTE')
      and (input_tenant_id is null or tenant_id = input_tenant_id)
  loop
    perform public.calculate_invoice_charges(invoice_record.id);
    processed_count := processed_count + 1;
  end loop;

  return processed_count;
end;
$$;

create or replace function public.maybe_open_maintenance_order()
returns trigger
language plpgsql
as $$
declare
  auto_create boolean;
begin
  if new.status = 'MANUTENCAO' and old.status is distinct from new.status then
    select auto_create_service_order_on_maintenance into auto_create
    from public.tenant_settings
    where tenant_id = new.tenant_id;

    if auto_create then
      insert into public.service_orders (tenant_id, client_id, vehicle_id, type, status, notes)
      values (new.tenant_id, new.client_id, new.id, 'MANUTENCAO', 'ABERTA', 'Gerada automaticamente pela mudança de status do veículo para manutenção.');
    end if;
  end if;

  return new;
end;
$$;

create or replace trigger trg_vehicles_open_maintenance_order
after update on public.vehicles
for each row execute function public.maybe_open_maintenance_order();

create or replace view public.vehicles_with_assets as
select
  v.id,
  v.tenant_id,
  v.client_id,
  c.name as customer,
  v.plate,
  v.brand,
  v.model,
  v.color,
  v.year,
  t.model as tracker_model,
  t.imei as tracker_imei,
  m.carrier as chip_carrier,
  m.iccid as chip_iccid,
  v.status,
  v.created_at
from public.vehicles v
join public.clients c on c.id = v.client_id
left join public.trackers t on t.id = v.tracker_id
left join public.m2m_chips m on m.id = v.chip_id;

create or replace view public.clients_financial_summary as
select
  c.id,
  c.tenant_id,
  c.name,
  c.document_number,
  c.whatsapp,
  c.city,
  c.state,
  count(distinct v.id) as vehicle_count,
  coalesce(sum(case when i.status in ('VENCIDO', 'INADIMPLENTE', 'PENDENTE') then i.total_amount else 0 end), 0) as outstanding_amount,
  case
    when coalesce(sum(case when i.status in ('VENCIDO', 'INADIMPLENTE') then i.total_amount else 0 end), 0) >= 3000 then 'RISCO'::public.health_score
    when coalesce(sum(case when i.status in ('VENCIDO', 'INADIMPLENTE') then i.total_amount else 0 end), 0) > 0 then 'ATENCAO'::public.health_score
    else 'SAUDAVEL'::public.health_score
  end as health_score
from public.clients c
left join public.vehicles v on v.client_id = c.id
left join public.invoices i on i.client_id = c.id and i.tenant_id = c.tenant_id
group by c.id, c.tenant_id, c.name, c.document_number, c.whatsapp, c.city, c.state;

create or replace view public.invoices_overview as
select
  i.id,
  i.tenant_id,
  c.name as customer,
  v.plate as vehicle,
  i.due_date,
  i.amount,
  i.late_fee_applied,
  i.interest_applied,
  i.total_amount,
  i.status,
  i.payment_method,
  case
    when i.status = 'INADIMPLENTE' then 'BLOQUEIO'
    when i.status = 'VENCIDO' then 'COBRANCA'
    else 'NORMAL'
  end as risk_bucket,
  i.created_at
from public.invoices i
join public.clients c on c.id = i.client_id
join public.vehicles v on v.id = i.vehicle_id;

create or replace view public.service_orders_overview as
select
  so.id,
  so.tenant_id,
  c.name as customer,
  v.plate as vehicle,
  so.type,
  so.status,
  so.technician_name,
  so.scheduled_for,
  so.created_at
from public.service_orders so
join public.clients c on c.id = so.client_id
join public.vehicles v on v.id = so.vehicle_id;

create or replace view public.collection_agreements_overview as
select
  ca.id,
  ca.tenant_id,
  c.name as client_name,
  ca.status,
  ca.original_amount,
  ca.negotiated_amount,
  ca.entry_amount,
  ca.installments,
  ca.next_due_date,
  ca.notes,
  ca.created_at
from public.collection_agreements ca
join public.clients c on c.id = ca.client_id;

create or replace view public.command_queue_overview as
select
  cq.id,
  cq.tenant_id,
  v.plate as vehicle,
  cq.command_type,
  cq.status,
  cq.reason,
  cq.requested_at,
  cq.processed_at
from public.command_queue cq
join public.vehicles v on v.id = cq.vehicle_id;

create or replace view public.client_contacts_overview as
select
  cc.id,
  cc.tenant_id,
  cc.client_id,
  c.name as client_name,
  cc.name,
  cc.role,
  cc.phone,
  cc.email,
  cc.is_financial_contact,
  cc.is_primary,
  cc.created_at
from public.client_contacts cc
join public.clients c on c.id = cc.client_id;

create or replace function public.dashboard_revenue_last_six_months(input_tenant_id uuid)
returns table (month text, value numeric)
language sql
stable
as $$
  with months as (
    select generate_series(date_trunc('month', current_date) - interval '5 months', date_trunc('month', current_date), interval '1 month')::date as month_date
  )
  select
    to_char(month_date, 'Mon') as month,
    coalesce(sum(i.total_amount), 0) as value
  from months m
  left join public.invoices i
    on i.tenant_id = input_tenant_id
   and date_trunc('month', i.reference_month) = date_trunc('month', m.month_date)
  group by month_date
  order by month_date;
$$;

create or replace function public.manual_settle_invoice(
  input_tenant_id uuid,
  input_user_id uuid,
  input_invoice_id uuid,
  input_paid_amount numeric,
  input_paid_at timestamptz,
  input_note text,
  input_method text
)
returns void
language plpgsql
security definer
as $$
declare
  current_vehicle_id uuid;
begin
  update public.invoices
     set status = 'PAGO',
         paid_amount = input_paid_amount,
         paid_at = input_paid_at,
         notes = coalesce(notes, '') || E'\nBaixa manual: ' || coalesce(input_note, ''),
         updated_at = timezone('utc', now())
   where id = input_invoice_id
     and tenant_id = input_tenant_id
  returning vehicle_id into current_vehicle_id;

  if current_vehicle_id is null then
    raise exception 'Invoice not found for tenant';
  end if;

  insert into public.invoice_payments (tenant_id, invoice_id, user_id, paid_amount, paid_at, method, source, note)
  values (input_tenant_id, input_invoice_id, input_user_id, input_paid_amount, input_paid_at, input_method, 'MANUAL', input_note);

  update public.vehicles
     set status = 'ATIVO',
         blocked_reason = null,
         updated_at = timezone('utc', now())
   where id = current_vehicle_id
     and tenant_id = input_tenant_id;

  insert into public.audit_logs (tenant_id, actor_user_id, entity_name, entity_id, action, description, metadata)
  values (
    input_tenant_id,
    input_user_id,
    'invoices',
    input_invoice_id,
    'MANUAL_SETTLEMENT',
    'Fatura baixada manualmente.',
    jsonb_build_object('amount', input_paid_amount, 'paid_at', input_paid_at, 'method', input_method, 'note', input_note)
  );
end;
$$;

create or replace function public.apply_payment_webhook(
  input_tenant_id uuid,
  input_invoice_id uuid,
  input_paid_amount numeric,
  input_paid_at timestamptz,
  input_transaction_id text,
  input_signature text
)
returns void
language plpgsql
security definer
as $$
declare
  current_vehicle_id uuid;
begin
  update public.invoices
     set status = 'PAGO',
         paid_amount = input_paid_amount,
         paid_at = input_paid_at,
         external_transaction_id = input_transaction_id,
         updated_at = timezone('utc', now())
   where id = input_invoice_id
     and tenant_id = input_tenant_id
  returning vehicle_id into current_vehicle_id;

  if current_vehicle_id is null then
    raise exception 'Invoice not found for tenant';
  end if;

  insert into public.invoice_payments (tenant_id, invoice_id, paid_amount, paid_at, method, source, transaction_id, note)
  values (input_tenant_id, input_invoice_id, input_paid_amount, input_paid_at, 'PIX', 'WEBHOOK', input_transaction_id, 'Liquidação automática via webhook');

  update public.vehicles
     set status = 'ATIVO',
         blocked_reason = null,
         updated_at = timezone('utc', now())
   where id = current_vehicle_id
     and tenant_id = input_tenant_id;

  insert into public.audit_logs (tenant_id, entity_name, entity_id, action, description, metadata)
  values (
    input_tenant_id,
    'invoices',
    input_invoice_id,
    'WEBHOOK_SETTLEMENT',
    'Fatura liquidada automaticamente via webhook.',
    jsonb_build_object('amount', input_paid_amount, 'paid_at', input_paid_at, 'transaction_id', input_transaction_id, 'signature', input_signature)
  );
end;
$$;

create or replace function public.open_collection_agreement(
  input_tenant_id uuid,
  input_user_id uuid,
  input_client_id uuid,
  input_original_amount numeric,
  input_negotiated_amount numeric,
  input_entry_amount numeric,
  input_installments integer,
  input_next_due_date date,
  input_notes text
)
returns void
language plpgsql
security definer
as $$
declare
  agreement_id uuid;
begin
  insert into public.collection_agreements (
    tenant_id,
    client_id,
    status,
    original_amount,
    negotiated_amount,
    entry_amount,
    installments,
    next_due_date,
    notes,
    created_by
  )
  values (
    input_tenant_id,
    input_client_id,
    'ATIVA',
    input_original_amount,
    input_negotiated_amount,
    input_entry_amount,
    input_installments,
    input_next_due_date,
    input_notes,
    input_user_id
  )
  returning id into agreement_id;

  insert into public.audit_logs (tenant_id, actor_user_id, entity_name, entity_id, action, description, metadata)
  values (
    input_tenant_id,
    input_user_id,
    'collection_agreements',
    agreement_id,
    'COLLECTION_AGREEMENT_CREATED',
    'Acordo de renegociação criado.',
    jsonb_build_object('client_id', input_client_id, 'negotiated_amount', input_negotiated_amount, 'installments', input_installments)
  );
end;
$$;

create or replace function public.enqueue_vehicle_command(
  input_tenant_id uuid,
  input_user_id uuid,
  input_vehicle_id uuid,
  input_command_type public.command_type,
  input_reason text
)
returns void
language plpgsql
security definer
as $$
declare
  command_id uuid;
begin
  insert into public.command_queue (tenant_id, vehicle_id, requested_by, command_type, reason)
  values (input_tenant_id, input_vehicle_id, input_user_id, input_command_type, input_reason)
  returning id into command_id;

  insert into public.audit_logs (tenant_id, actor_user_id, entity_name, entity_id, action, description, metadata)
  values (
    input_tenant_id,
    input_user_id,
    'command_queue',
    command_id,
    'COMMAND_ENQUEUED',
    'Comando remoto enfileirado.',
    jsonb_build_object('vehicle_id', input_vehicle_id, 'command_type', input_command_type, 'reason', input_reason)
  );
end;
$$;

create or replace function public.billing_engine_candidates()
returns table (
  tenant_id uuid,
  invoice_id uuid,
  vehicle_id uuid,
  customer_name text,
  whatsapp_phone text,
  due_date text,
  total_amount numeric,
  pix_key text,
  rule_type text,
  reactivation_fee_amount numeric
)
language sql
stable
as $$
  with settings as (
    select
      tenant_id,
      pix_key,
      reminder_days_before,
      overdue_days_to_warn,
      overdue_days_to_block,
      grace_period_days,
      reactivation_fee_amount,
      skip_weekend_charges
    from public.tenant_settings
  ),
  base as (
    select
      i.tenant_id,
      i.id as invoice_id,
      i.vehicle_id,
      c.name as customer_name,
      regexp_replace(c.whatsapp, '\\D', '', 'g') as whatsapp_phone,
      to_char(i.due_date, 'DD/MM/YYYY') as due_date,
      i.total_amount,
      s.pix_key,
      s.reactivation_fee_amount,
      case
        when i.status = 'PENDENTE' and i.due_date = current_date + s.reminder_days_before then 'D_MINUS_3'
        when i.status in ('PENDENTE', 'VENCIDO') and current_date >= i.due_date + s.grace_period_days + s.overdue_days_to_warn then 'D_PLUS_1'
        when i.status in ('PENDENTE', 'VENCIDO') and current_date >= i.due_date + s.grace_period_days + s.overdue_days_to_block then 'D_PLUS_5'
      end as rule_type,
      s.skip_weekend_charges
    from public.invoices i
    join public.clients c on c.id = i.client_id
    join settings s on s.tenant_id = i.tenant_id
  )
  select tenant_id, invoice_id, vehicle_id, customer_name, whatsapp_phone, due_date, total_amount, pix_key, rule_type, reactivation_fee_amount
  from base
  where rule_type is not null
    and (not skip_weekend_charges or not public.is_weekend(current_date));
$$;

create or replace function public.generate_monthly_invoices(input_reference_date date default current_date)
returns integer
language plpgsql
security definer
as $$
declare
  contract_record record;
  generated_count integer := 0;
  reference_month date := date_trunc('month', input_reference_date)::date;
  due_date_value date;
begin
  for contract_record in
    select * from public.contracts where status = 'ATIVO' and starts_at <= input_reference_date and (ends_at is null or ends_at >= input_reference_date)
  loop
    due_date_value := make_date(extract(year from input_reference_date)::int, extract(month from input_reference_date)::int, contract_record.billing_day);

    insert into public.invoices (
      tenant_id,
      contract_id,
      client_id,
      vehicle_id,
      reference_month,
      due_date,
      amount,
      status,
      payment_method,
      pix_copy_paste,
      notes
    )
    values (
      contract_record.tenant_id,
      contract_record.id,
      contract_record.client_id,
      contract_record.vehicle_id,
      reference_month,
      due_date_value,
      contract_record.monthly_amount,
      'PENDENTE',
      contract_record.payment_method,
      (select pix_key from public.tenant_settings where tenant_id = contract_record.tenant_id),
      'Gerado automaticamente pelo motor de faturamento.'
    )
    on conflict (tenant_id, contract_id, reference_month) do nothing;

    generated_count := generated_count + 1;
  end loop;

  return generated_count;
end;
$$;

alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.trackers enable row level security;
alter table public.m2m_chips enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_orders enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.collection_agreements enable row level security;
alter table public.command_queue enable row level security;
alter table public.whatsapp_sessions enable row level security;
alter table public.whatsapp_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.support_tickets enable row level security;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id', '')::uuid;
$$;

create policy "tenant scoped select clients" on public.clients for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped insert clients" on public.clients for insert with check (tenant_id = public.current_tenant_id());
create policy "tenant scoped update clients" on public.clients for update using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy "tenant scoped select client_contacts" on public.client_contacts for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped insert client_contacts" on public.client_contacts for insert with check (tenant_id = public.current_tenant_id());
create policy "tenant scoped select vehicles" on public.vehicles for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select service_orders" on public.service_orders for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select invoices" on public.invoices for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select contracts" on public.contracts for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select agreements" on public.collection_agreements for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select command_queue" on public.command_queue for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select settings" on public.tenant_settings for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select trackers" on public.trackers for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select chips" on public.m2m_chips for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select logs" on public.whatsapp_logs for select using (tenant_id = public.current_tenant_id());
create policy "tenant scoped select audit" on public.audit_logs for select using (tenant_id = public.current_tenant_id());

insert into public.tenants (id, legal_name, trade_name, cnpj, email, phone)
values ('11111111-1111-1111-1111-111111111111', 'Rota Segura Monitoramento Ltda', 'Rota Segura', '48.765.100/0001-55', 'contato@rotasegura.com.br', '+551130300400')
on conflict (id) do nothing;

insert into public.users (id, tenant_id, full_name, email, role, whatsapp)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Ana Gestora', 'ana@rotasegura.com.br', 'OWNER', '+5511999999999')
on conflict (id) do nothing;

insert into public.tenant_settings (
  tenant_id,
  company_name,
  cnpj,
  pix_key,
  boleto_instructions,
  grace_period_days,
  late_fee_percent,
  daily_interest_percent,
  reactivation_fee_amount,
  allow_partial_payments,
  skip_weekend_charges,
  auto_create_service_order_on_maintenance
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Rota Segura Monitoramento',
  '48.765.100/0001-55',
  'financeiro@rotasegura.com.br',
  'Pagável em qualquer banco até o vencimento.',
  2,
  2,
  0.033,
  39.90,
  true,
  true,
  true
)
on conflict (tenant_id) do nothing;

insert into public.clients (id, tenant_id, name, document_type, document_number, whatsapp, email, zip_code, street, number, neighborhood, city, state, notes)
values
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Transportes Atlas Ltda', 'CNPJ', '12.345.678/0001-90', '+55 11 98888-0001', 'frotas@atlas.com.br', '01001-000', 'Av. Central', '1000', 'Centro', 'São Paulo', 'SP', 'Cliente enterprise com SLA premium'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Construtora Horizonte', 'CNPJ', '55.612.457/0001-70', '+55 31 97777-9000', 'financeiro@horizonte.com.br', '30110-012', 'Rua das Acácias', '88', 'Savassi', 'Belo Horizonte', 'MG', 'Cobrança via boleto e PIX')
on conflict (id) do nothing;

insert into public.client_contacts (id, tenant_id, client_id, name, role, phone, email, is_financial_contact, is_primary)
values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Mariana Freitas', 'Financeiro', '+55 11 97777-1122', 'mariana@atlas.com.br', true, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Felipe Rocha', 'Gestor de Frota', '+55 31 98888-6655', 'felipe@horizonte.com.br', false, true)
on conflict (id) do nothing;

insert into public.trackers (id, tenant_id, imei, model, manufacturer, status)
values
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '356938035643809', 'Teltonika FMC920', 'Teltonika', 'EM_USO'),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '356938035643801', 'Queclink GV57', 'Queclink', 'EM_USO')
on conflict (id) do nothing;

insert into public.m2m_chips (id, tenant_id, iccid, carrier, line_number, status)
values
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '8955000000000012345', 'Claro M2M', '11988880001', 'EM_USO'),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '8955000000000067890', 'Vivo M2M', '31977779000', 'EM_USO')
on conflict (id) do nothing;

insert into public.vehicles (id, tenant_id, client_id, tracker_id, chip_id, plate, brand, model, color, year, installation_date, status)
values
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555551', 'BRA2E19', 'Volkswagen', 'Delivery 11.180', 'Branco', 2022, current_date - 90, 'ATIVO'),
('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444442', '55555555-5555-5555-5555-555555555552', 'QXP0A44', 'Fiat', 'Strada', 'Prata', 2023, current_date - 45, 'AVISO_BLOQUEIO')
on conflict (id) do nothing;

insert into public.service_orders (id, tenant_id, client_id, vehicle_id, type, status, technician_name, scheduled_for, notes)
values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '66666666-6666-6666-6666-666666666661', 'MANUTENCAO', 'AGENDADA', 'Carlos Silva', timezone('utc', now()) + interval '2 days', 'Revisão preventiva do chicote'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', '66666666-6666-6666-6666-666666666662', 'SUPORTE_CAMPO', 'EM_EXECUCAO', 'Equipe Externa', timezone('utc', now()) + interval '1 day', 'Verificar perda de comunicação')
on conflict (id) do nothing;

insert into public.contracts (id, tenant_id, client_id, vehicle_id, monthly_amount, billing_day, payment_method, starts_at, status, notes)
values
('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '66666666-6666-6666-6666-666666666661', 69.90, 26, 'PIX', current_date - 365, 'ATIVO', 'Contrato padrão frota leve'),
('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', '66666666-6666-6666-6666-666666666662', 89.90, 22, 'BOLETO', current_date - 200, 'ATIVO', 'Cliente com cobrança em boleto')
on conflict (id) do nothing;

select public.generate_monthly_invoices(current_date);

update public.invoices
   set due_date = current_date + 3,
       amount = 69.90,
       late_fee_applied = 0,
       interest_applied = 0,
       status = 'PENDENTE',
       pix_copy_paste = '00020126580014BR.GOV.BCB.PIX0136financeiro@rotasegura.com.br'
 where contract_id = '77777777-7777-7777-7777-777777777771'
   and reference_month = date_trunc('month', current_date)::date;

update public.invoices
   set due_date = current_date - 1,
       amount = 89.90,
       late_fee_applied = 4.50,
       interest_applied = 0.90,
       status = 'VENCIDO',
       boleto_url = 'https://boleto.exemplo.com/123',
       boleto_barcode = '34191790010104351004791020150008291070000008990'
 where contract_id = '77777777-7777-7777-7777-777777777772'
   and reference_month = date_trunc('month', current_date)::date;

insert into public.collection_agreements (id, tenant_id, client_id, status, original_amount, negotiated_amount, entry_amount, installments, next_due_date, notes, created_by)
values (
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333332',
  'ATIVA',
  1899.80,
  1650.00,
  450.00,
  3,
  current_date + 5,
  'Negociação com entrada e três parcelas.',
  '22222222-2222-2222-2222-222222222222'
)
on conflict (id) do nothing;

insert into public.command_queue (id, tenant_id, vehicle_id, requested_by, command_type, status, reason, requested_at)
values
('dddddddd-dddd-dddd-dddd-ddddddddddd1', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222222', 'BLOQUEAR', 'PENDENTE', 'Bloqueio preventivo por atraso recorrente', timezone('utc', now())),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', 'REINICIAR_RASTREADOR', 'SUCESSO', 'Teste operacional do equipamento', timezone('utc', now()) - interval '1 hour')
on conflict (id) do nothing;
