import { z } from 'zod';
import { supabase, supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const emptyToNull = z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional());

const recordSchema = z.object({
  name: emptyToNull,
  roll_number: emptyToNull,
  batch: emptyToNull,
  place: emptyToNull,
  year: emptyToNull,
  tournament: emptyToNull,
  event: emptyToNull,
  gender: emptyToNull,
  record: emptyToNull,
});

export default async function handler(req, res) {
  const { id, action } = req.query;
  const path = id || action || null;

  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { data, error } = await supabase
      .from('all_time_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (path === 'bulk') {
      try {
        if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected an array of records' });
        
        const records = [];
        const errors = [];
        req.body.forEach((r, idx) => {
          const result = recordSchema.safeParse(r);
          if (!result.success) {
            errors.push(`Row ${idx + 1}: ${result.error.errors.map(e => `${e.path.join('.') || 'field'} - ${e.message}`).join(', ')}`);
          } else {
            records.push(result.data);
          }
        });

        if (errors.length > 0) {
          return res.status(400).json({ error: `Validation failed:\n${errors.join('\n')}` });
        }
        
        const { data, error } = await supabaseAdmin
          .from('all_time_records')
          .insert(records);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ msg: 'Bulk records added successfully', data });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Server error' });
      }
    } else {
      try {
        const validatedData = recordSchema.parse(req.body);
        const { data, error } = await supabaseAdmin
          .from('all_time_records')
          .insert([validatedData]);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ msg: 'Record added successfully', data });
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ error: e.errors });
        }
        return res.status(500).json({ error: 'Server error' });
      }
    }
  }

  if (req.method === 'PUT') {
    const id = path;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    try {
      const validatedData = recordSchema.parse(req.body);
      const { data, error } = await supabaseAdmin
        .from('all_time_records')
        .update(validatedData)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Record not found' });
      return res.status(200).json({ msg: 'Record updated', data: data[0] });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    const id = path;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    try {
      const { data, error } = await supabaseAdmin
        .from('all_time_records')
        .delete()
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      if (!data || data.length === 0) return res.status(404).json({ error: 'Record not found' });
      return res.status(200).json({ msg: 'Record deleted' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
