// skysniper-backend/syncRound.js
import { config } from './utils/configLoader.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE);

export default async function syncRound(req, res) {
  const round = req.body;

  if (!round || !round.round_id || !round.crash_multiplier) {
    return res.status(400).json({ error: "Invalid round data" });
  }

  try {
    const { data, error } = await supabase
      .from('rounds')
      .insert([round]);

    if (error) throw error;

    res.json({ success: true, inserted: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
