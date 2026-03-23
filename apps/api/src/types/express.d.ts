import 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tenantId: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
