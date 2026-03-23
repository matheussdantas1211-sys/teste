import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { signToken } from '../utils/jwt';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function login(body: unknown) {
  const { email } = loginSchema.parse(body);

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, tenant_id, email, role, full_name')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('Usuário não encontrado. Cadastre-o no Supabase antes do primeiro login.');
  }

  return {
    token: signToken({
      sub: data.id,
      tenantId: data.tenant_id,
      email: data.email,
      role: data.role
    }),
    user: data
  };
}
