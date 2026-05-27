import { supabaseAdmin, authenticateAdmin } from '../../utils/supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;

  const auth = await authenticateAdmin(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  if (req.method === 'PUT') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'student' })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ msg: 'Admin removed', data });
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
