import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthTokenPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.API_JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.API_JWT_SECRET) as AuthTokenPayload;
}
