import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboardOverview } from '../services/dashboard.service';

export const dashboardRouter = Router();

dashboardRouter.get('/overview', authMiddleware, async (request, response, next) => {
  try {
    const result = await getDashboardOverview(request.auth!.tenantId);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});
