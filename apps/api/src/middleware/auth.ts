import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Token JWT ausente.' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = verifyToken(token);

    request.auth = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role
    };

    return next();
  } catch {
    return response.status(401).json({ message: 'Token JWT inválido.' });
  }
}
