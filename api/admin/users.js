import { supabaseAdmin, authenticateAdmin } from '../../utils/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
