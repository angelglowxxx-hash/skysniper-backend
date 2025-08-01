// SkySniper — dbConnector.js v1.0
// ☁️ Inserts round data into Supabase table

import { createClient } from '@supabase/supabase-js';
import { config } from './configLoader.js'; // loads from .env

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

// 🧩 Save one round to Supabase
export async function saveRoundToSupabase(round) {
  try {
    const { data, error } = await supabase
      .from('rounds')
      .insert([{
        round_id: round.round_id,
        crash_multiplier: round.crash_multiplier,
        timestamp: round.timestamp,
        tag: round.tag
      }]);

    if (error) {
      console.warn("❌ Supabase insert failed:", error.message);
      return false;
    }

    console.log("✅ Round saved to Supabase:", data);
    return true;
  } catch (err) {
    console.error("❌ Supabase insert error:", err);
    return false;
  }
}

// 📦 Save multiple rounds (batch insert)
export async function saveRoundsBatch(rounds = []) {
  if (!Array.isArray(rounds) || rounds.length === 0) return false;

  try {
    const { data, error } = await supabase
      .from('rounds')
      .insert(rounds.map(r => ({
        round_id: r.round_id,
        crash_multiplier: r.crash_multiplier,
        timestamp: r.timestamp,
        tag: r.tag
      })));

    if (error) {
      console.warn("❌ Batch insert failed:", error.message);
      return false;
    }

    console.log(`✅ ${rounds.length} rounds saved to Supabase`);
    return true;
  } catch (err) {
    console.error("❌ Batch insert error:", err);
    return false;
  }
}
