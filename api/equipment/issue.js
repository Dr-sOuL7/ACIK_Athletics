import { z } from 'zod';
import { supabase } from '../utils/supabase.js';

const issueSchema = z.object({
  equipment_id: z.string().uuid(),
  name: z.string().min(1),
  batch: z.string().min(1),
  roll_number: z.string().min(1),
  issue_quantity: z.number().int().min(1),
  issue_date: z.string().min(1), // format YYYY-MM-DD
  from_time: z.string().min(1), // format HH:MM
  till_time: z.string().min(1), // format HH:MM
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });

  try {
    const validatedData = issueSchema.parse(req.body);

    // Call the RPC function to atomically update inventory and insert issue record
    const { data, error } = await supabase.rpc('issue_equipment', {
      p_equipment_id: validatedData.equipment_id,
      p_name: validatedData.name,
      p_batch: validatedData.batch,
      p_roll_number: validatedData.roll_number,
      p_quantity: validatedData.issue_quantity,
      p_date: validatedData.issue_date,
      p_from_time: validatedData.from_time,
      p_till_time: validatedData.till_time
    });

    if (error) {
      console.error('RPC Error:', error);
      return res.status(400).json({ error: error.message || 'Failed to issue equipment' });
    }

    return res.status(201).json({ msg: 'Equipment issued successfully', data });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors });
    }
    console.error('Server error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
