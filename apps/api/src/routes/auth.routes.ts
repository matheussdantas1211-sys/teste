import { Router } from 'express';
import { login } from '../services/auth.service';

export const authRouter = Router();

authRouter.post('/login', async (request, response, next) => {
  try {
    const result = await login(request.body);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});
