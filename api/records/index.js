import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../../utils/supabase.js';

const recordSchema = z.object({
  name: z.string().min(1),
  roll_number: z.string().min(1),
  batch: z.string().optional(),
  place: z.string().optional(),
  date: z.string().optional(),
  tournament: z.string().optional(),
  event: z.string().min(1),
  record: z.string().optional(),
  iism_record: z.string().optional(),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('all_time_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = recordSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('all_time_records')
        .upsert([validatedData], { onConflict: 'roll_number,event' });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Record added successfully', data });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
