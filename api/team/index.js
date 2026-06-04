import { z } from 'zod';
import { supabase, supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const teamSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  post: z.string().min(1),
  photo_url: z.string().url().optional().nullable(),
  photo_width: z.number().int().optional().nullable(),
  photo_height: z.number().int().optional().nullable(),
});

const teamUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  post: z.string().min(1).optional(),
  photo_url: z.string().url().optional().nullable(),
  photo_width: z.number().int().optional().nullable(),
  photo_height: z.number().int().optional().nullable(),
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true }); // Ordered by creation or could add order field later

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = teamSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('team_members')
        .insert([validatedData])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Team member added successfully', data: data[0] });
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
      const validatedData = teamUpdateSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('team_members')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Team member not found' });
      return res.status(200).json({ msg: 'Team member updated', data: data[0] });
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
        .from('team_members')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Team member not found' });
      return res.status(200).json({ msg: 'Team member deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
