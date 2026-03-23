import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';

export const manualSettlementSchema = z.object({
  invoiceId: z.string().uuid(),
  paidAmount: z.number().positive(),
  paidAt: z.string().datetime(),
  note: z.string().min(3),
  method: z.enum(['PIX', 'DINHEIRO', 'TRANSFERENCIA', 'CARTAO'])
});

export async function settleInvoiceManually(tenantId: string, userId: string, payload: unknown) {
  const data = manualSettlementSchema.parse(payload);

  const { error } = await supabaseAdmin.rpc('manual_settle_invoice', {
    input_tenant_id: tenantId,
    input_user_id: userId,
    input_invoice_id: data.invoiceId,
    input_paid_amount: data.paidAmount,
    input_paid_at: data.paidAt,
    input_note: data.note,
    input_method: data.method
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function handlePaymentWebhook(body: unknown, signature?: string) {
  const payload = z.object({
    invoiceId: z.string().uuid(),
    paidAmount: z.number().positive(),
    paidAt: z.string().datetime(),
    transactionId: z.string().min(3),
    tenantId: z.string().uuid()
  }).parse(body);

  const { error } = await supabaseAdmin.rpc('apply_payment_webhook', {
    input_tenant_id: payload.tenantId,
    input_invoice_id: payload.invoiceId,
    input_paid_amount: payload.paidAmount,
    input_paid_at: payload.paidAt,
    input_transaction_id: payload.transactionId,
    input_signature: signature ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
