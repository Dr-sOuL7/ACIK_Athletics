import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const photoSchema = z.object({
  image_url: z.string().url(),
  category: z.string().min(1),
  caption: z.string().optional(),
});

const photoUpdateSchema = z.object({
  category: z.string().min(1).optional(),
  caption: z.string().optional(),
});

export default async function handler(req, res) {
  const { slug } = req.query;
  const slugArray = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const id = slugArray.length > 0 ? slugArray[0] : null;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = photoSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('gallery')
        .insert([validatedData])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Photo added successfully', data: data[0] });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = photoUpdateSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('gallery')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Photo not found' });
      return res.status(200).json({ msg: 'Photo updated', data: data[0] });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const { data, error } = await supabaseAdmin
        .from('gallery')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Photo not found' });
      return res.status(200).json({ msg: 'Photo deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
