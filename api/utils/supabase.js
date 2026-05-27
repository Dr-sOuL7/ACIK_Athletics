import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase credentials in environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function authenticateUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { error: 'No token provided', status: 401 };

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: 'Invalid token', status: 401 };

  return { user };
}

export async function authenticateAdmin(req) {
  const { user, error, status } = await authenticateUser(req);
  if (error) return { error, status };

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required', status: 403 };
  }

  return { user, profile };
}
