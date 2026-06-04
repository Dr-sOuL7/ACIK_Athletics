import { z } from 'zod';
import { supabase, supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const equipmentSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(0),
  category: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  image_width: z.number().int().optional(),
  image_height: z.number().int().optional(),
});

const equipmentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  image_width: z.number().int().optional(),
  image_height: z.number().int().optional(),
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const validatedData = equipmentSchema.parse(req.body);
      const dataToInsert = {
        ...validatedData,
        available_quantity: validatedData.quantity
      };
      
      const { data, error } = await supabaseAdmin
        .from('equipment')
        .insert([dataToInsert])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Equipment added successfully', data: data[0] });
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
      const validatedData = equipmentUpdateSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('equipment')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Equipment not found' });
      return res.status(200).json({ msg: 'Equipment updated', data: data[0] });
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
        .from('equipment')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Equipment not found' });
      return res.status(200).json({ msg: 'Equipment deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
