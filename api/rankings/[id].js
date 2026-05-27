import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../../utils/supabase.js';

const rankingSchema = z.object({
  gold_medals: z.number().int().nonnegative().optional(),
  silver_medals: z.number().int().nonnegative().optional(),
  bronze_medals: z.number().int().nonnegative().optional(),
  total_points: z.number().int().nonnegative().optional(),
  ranking_position: z.number().int().min(1).optional(),
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

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
