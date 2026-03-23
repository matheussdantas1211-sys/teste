import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  API_PORT: z.string().default('3333'),
  API_JWT_SECRET: z.string().min(10),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  BAILEYS_SESSION_DIR: z.string().default('.baileys'),
  WHATSAPP_DEFAULT_COUNTRY: z.string().default('55'),
  WEBHOOK_SHARED_SECRET: z.string().default('change-me')
});

export const env = envSchema.parse(process.env);
