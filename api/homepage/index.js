import { z } from 'zod';
import { supabase, supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const homepageSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  announcement: z.string().optional(),
  banner_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = homepageSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('homepage_content')
        .update(validatedData)
        .eq('id', 1);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ msg: 'Homepage updated', data });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
