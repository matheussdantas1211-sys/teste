import { Router } from 'express';
import { authRouter } from './auth.routes';
import { dashboardRouter } from './dashboard.routes';
import { financeRouter } from './finance.routes';
import { whatsappRouter } from './whatsapp.routes';
import { resourcesRouter } from './resources.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/whatsapp', whatsappRouter);
apiRouter.use('/resources', resourcesRouter);
