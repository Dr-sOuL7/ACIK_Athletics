import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testDelete() {
  const { data: rankings, error: getErr } = await supabaseAdmin.from('rankings').select('id').limit(1);
  if (getErr) {
    console.error("Get Error:", getErr);
    return;
  }
  if (!rankings || rankings.length === 0) {
    console.log("No rankings to delete.");
    return;
  }
  
  const id = rankings[0].id;
  console.log("Attempting to delete ID:", id);
  
  const { data, error } = await supabaseAdmin.from('rankings').delete().eq('id', id);
  if (error) {
    console.error("Delete Error:", error);
  } else {
    console.log("Delete Success:", data);
  }
}

testDelete();
