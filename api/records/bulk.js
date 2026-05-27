import { z } from 'zod';
import { supabaseAdmin, authenticateAdmin } from '../utils/supabase.js';

const recordSchema = z.object({
  name: z.string().min(1),
  roll_number: z.string().min(1),
  batch: z.string().optional(),
  place: z.string().optional(),
  date: z.string().optional(),
  tournament: z.string().optional(),
  event: z.string().min(1),
  record: z.string().optional(),
  iism_record: z.string().optional(),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

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
        .upsert(records, { onConflict: 'roll_number,event' });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ msg: 'Bulk records added successfully', data });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
