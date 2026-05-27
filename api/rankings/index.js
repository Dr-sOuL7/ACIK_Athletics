import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const rankingSchema = z.object({
  athlete_name: z.string().min(1),
  event_name: z.string().min(1),
  gold_medals: z.coerce.number().int().nonnegative().optional().default(0),
  silver_medals: z.coerce.number().int().nonnegative().optional().default(0),
  bronze_medals: z.coerce.number().int().nonnegative().optional().default(0),
  total_points: z.coerce.number().int().nonnegative().optional().default(0),
  ranking_position: z.coerce.number().int().min(1),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('rankings')
      .select('*')
      .order('ranking_position', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = rankingSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('rankings')
        .insert([validatedData]);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Ranking added', data });
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
