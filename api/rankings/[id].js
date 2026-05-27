import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const rankingSchema = z.object({
  gold_medals: z.coerce.number().int().nonnegative().optional().default(0),
  silver_medals: z.coerce.number().int().nonnegative().optional().default(0),
  bronze_medals: z.coerce.number().int().nonnegative().optional().default(0),
  total_points: z.coerce.number().int().nonnegative().optional().default(0),
  ranking_position: z.coerce.number().int().min(1).optional(),
});

export default async function handler(req, res) {
  const { id } = req.query;

  const auth = await authenticateAdmin(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  if (req.method === 'PUT') {
    try {
      const validatedData = rankingSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('rankings')
        .update(validatedData)
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ msg: 'Ranking updated', data });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('rankings')
        .delete()
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ msg: 'Ranking deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
