import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const recordSchema = z.object({
  name: z.string().min(1).optional(),
  roll_number: z.string().min(1).optional(),
  batch: z.string().optional(),
  place: z.string().optional(),
  date: z.string().optional(),
  tournament: z.string().optional(),
  event: z.string().min(1).optional(),
  record: z.string().optional(),
  iism_record: z.string().optional(),
});

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'PUT') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    try {
      const validatedData = recordSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('all_time_records')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Record not found' });
      return res.status(200).json({ msg: 'Record updated', data: data[0] });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const { data, error } = await supabaseAdmin
        .from('all_time_records')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Record not found' });
      return res.status(200).json({ msg: 'Record deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
