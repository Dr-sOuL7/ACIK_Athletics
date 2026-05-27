import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  category: z.string().optional(),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = eventSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert([validatedData]);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Event added', data });
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
