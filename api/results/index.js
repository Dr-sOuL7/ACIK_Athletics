import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const resultSchema = z.object({
  athlete_name: z.string().min(1),
  event_name: z.string().min(1),
  position: z.string().optional(),
  performance: z.string().optional(),
  isBest: z.boolean().or(z.string().transform(v => v === 'true')).optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = resultSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('results')
        .insert([{
          athlete_name: validatedData.athlete_name,
          event_name: validatedData.event_name,
          position: validatedData.position,
          performance: validatedData.performance,
          is_best: validatedData.isBest,
          photo_url: validatedData.photo_url || null,
        }]);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Result uploaded successfully', data });
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
