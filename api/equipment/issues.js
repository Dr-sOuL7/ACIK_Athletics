import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const auth = await authenticateAdmin(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    // Fetch issuance history, ordering by created_at DESC as requested by user
    // Join with equipment table to get the equipment name
    const { data, error } = await supabaseAdmin
      .from('equipment_issues')
      .select(`
        *,
        equipment:equipment_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error('Server error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
