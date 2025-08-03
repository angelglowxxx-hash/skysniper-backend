// SkySniper — routes/uiState.js
// 🧠 Returns HUD state (loading, ready, error) + AI commentary for live frontend updates

import express from 'express';
import { supabase } from '../supabase/client.js';

const router = express.Router();

// 🔍 GET /uiState?round_id=12345&site_url=example.com
router.get('/', async (req, res) => {
  const { round_id, site_url } = req.query;

  if (!round_id || !site_url) {
    return res.status(400).json({ error: 'Missing round_id or site_url' });
  }

  try {
    // 🧪 Check prediction status
    const { data: prediction, error } = await supabase
      .from('prediction_logs')
      .select('*')
      .eq('round_id', round_id)
      .eq('site_url', site_url)
      .single();

    if (error || !prediction) {
      return res.json({
        state: 'loading',
        message: 'Sniping result…',
        commentary: null
      });
    }

    // ✅ Prediction found
    res.json({
      state: 'ready',
      round_id: prediction.round_id,
      prediction: prediction.predicted_multiplier,
      commentary: prediction.commentary || 'Prediction complete. Proceed with caution.',
      tag: prediction.tag || 'unknown',
      confidence: prediction.confidence || 'medium'
    });
  } catch (err) {
    console.error('❌ uiState error:', err.message);
    res.status(500).json({
      state: 'error',
      message: 'Prediction failed or unavailable.',
      commentary: 'AI could not process this round. Try again or check site fingerprint.'
    });
  }
});

export default router;
