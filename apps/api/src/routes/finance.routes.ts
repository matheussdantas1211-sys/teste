import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { handlePaymentWebhook, settleInvoiceManually } from '../services/billing.service';

export const financeRouter = Router();

financeRouter.post('/settlements/manual', authMiddleware, async (request, response, next) => {
  try {
    const result = await settleInvoiceManually(request.auth!.tenantId, request.auth!.userId, request.body);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});

financeRouter.post('/webhooks/payment', async (request, response, next) => {
  try {
    const result = await handlePaymentWebhook(request.body, request.headers['x-webhook-signature'] as string | undefined);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});
