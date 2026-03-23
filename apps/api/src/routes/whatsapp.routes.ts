import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ensureWhatsAppConnection, getWhatsAppStatus } from '../services/whatsapp.service';

export const whatsappRouter = Router();

whatsappRouter.post('/connect', authMiddleware, async (_request, response, next) => {
  try {
    await ensureWhatsAppConnection();
    return response.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

whatsappRouter.get('/status', authMiddleware, async (_request, response, next) => {
  try {
    const result = await getWhatsAppStatus();
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});
