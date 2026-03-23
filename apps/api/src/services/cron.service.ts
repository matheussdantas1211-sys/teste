import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase';
import { sendBillingMessage } from './whatsapp.service';

function buildFriendlyMessage(name: string, amount: number, dueDate: string, pixKey: string) {
  return `Olá, ${name}. Sua mensalidade de rastreamento no valor de R$ ${amount.toFixed(2)} vence em ${dueDate}. PIX: ${pixKey}.`;
}

function buildOverdueMessage(name: string, amount: number, dueDate: string) {
  return `Olá, ${name}. Identificamos atraso da fatura de R$ ${amount.toFixed(2)} vencida em ${dueDate}. Seu veículo entrou em aviso preventivo de bloqueio.`;
}

function buildBlockMessage(name: string, amount: number, reactivationFee: number) {
  return `Olá, ${name}. A fatura de R$ ${amount.toFixed(2)} segue em aberto e o bloqueio foi solicitado. Taxa de reativação prevista: R$ ${reactivationFee.toFixed(2)}.`;
}

export async function runBillingEngine() {
  await supabaseAdmin.rpc('refresh_overdue_invoice_charges');
  const { data: invoices, error } = await supabaseAdmin.rpc('billing_engine_candidates');

  if (error) {
    throw new Error(error.message);
  }

  for (const invoice of invoices ?? []) {
    if (invoice.rule_type === 'D_MINUS_3') {
      await sendBillingMessage({
        tenantId: invoice.tenant_id,
        invoiceId: invoice.invoice_id,
        phone: invoice.whatsapp_phone,
        customerName: invoice.customer_name,
        template: 'Lembrete D-3',
        message: buildFriendlyMessage(invoice.customer_name, Number(invoice.total_amount), invoice.due_date, invoice.pix_key)
      });
    }

    if (invoice.rule_type === 'D_PLUS_1') {
      await supabaseAdmin.from('vehicles').update({ status: 'AVISO_BLOQUEIO' }).eq('tenant_id', invoice.tenant_id).eq('id', invoice.vehicle_id);
      await sendBillingMessage({
        tenantId: invoice.tenant_id,
        invoiceId: invoice.invoice_id,
        phone: invoice.whatsapp_phone,
        customerName: invoice.customer_name,
        template: 'Atraso D+1',
        message: buildOverdueMessage(invoice.customer_name, Number(invoice.total_amount), invoice.due_date)
      });
    }

    if (invoice.rule_type === 'D_PLUS_5') {
      await supabaseAdmin.from('invoices').update({ status: 'INADIMPLENTE' }).eq('tenant_id', invoice.tenant_id).eq('id', invoice.invoice_id);
      await supabaseAdmin.rpc('enqueue_vehicle_command', {
        input_tenant_id: invoice.tenant_id,
        input_user_id: null,
        input_vehicle_id: invoice.vehicle_id,
        input_command_type: 'BLOQUEAR',
        input_reason: 'Bloqueio automático por inadimplência no motor de cobrança'
      });
      await supabaseAdmin.from('vehicles').update({ status: 'BLOQUEADO', blocked_reason: 'Inadimplência' }).eq('tenant_id', invoice.tenant_id).eq('id', invoice.vehicle_id);
      await sendBillingMessage({
        tenantId: invoice.tenant_id,
        invoiceId: invoice.invoice_id,
        phone: invoice.whatsapp_phone,
        customerName: invoice.customer_name,
        template: 'Bloqueio D+5',
        message: buildBlockMessage(invoice.customer_name, Number(invoice.total_amount), Number(invoice.reactivation_fee_amount ?? 0))
      });
    }
  }

  return { processed: invoices?.length ?? 0 };
}

export function scheduleBillingEngine() {
  cron.schedule('0 8 * * *', async () => {
    await runBillingEngine();
  });
}
