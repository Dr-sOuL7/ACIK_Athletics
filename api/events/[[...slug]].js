import { z } from 'zod';
import { supabase, supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  event_date: z.string().optional().transform(v => v === '' ? null : v).nullable(),
  event_time: z.string().optional().transform(v => v === '' ? null : v).nullable(),
  category: z.string().optional(),
});

export default async function handler(req, res) {
  const { slug } = req.query;
  const slugArray = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const id = slugArray.length > 0 ? slugArray[0] : null;

  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { data, error } = await supabase
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

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    try {
      const validatedData = eventSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('events')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Event not found' });
      return res.status(200).json({ msg: 'Event updated', data: data[0] });
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
        .from('events')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Event not found' });
      return res.status(200).json({ msg: 'Event deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
