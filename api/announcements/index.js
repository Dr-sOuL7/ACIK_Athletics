import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const announcementSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = announcementSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert([validatedData]);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Announcement added', data });
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
