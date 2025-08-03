// SkySniper — routes/classify.js
// 🧠 Classify incoming site fingerprint using AI and store result in Supabase

import express from 'express';
import { classifySite } from '../utils/classifier.js';
import { supabase } from '../supabase/client.js';

const router = express.Router();

// 🔍 POST /classify
router.post('/', async (req, res) => {
  const { site_url, dom_signature, network_patterns } = req.body;

  if (!site_url || !dom_signature) {
    return res.status(400).json({ error: 'Missing site_url or dom_signature' });
  }

  try {
    // 🧠 Ask AI to classify the site
    const result = await classifySite({ site_url, dom_signature, network_patterns });

    // 🗃️ Store classification in Supabase
    const { data, error } = await supabase
      .from('site_classifications')
      .upsert({
        site_url,
        type: result.type,
        confidence: result.confidence,
        modules: result.modules,
        last_checked: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ status: 'classified', result });
  } catch (err) {
    console.error('❌ Classification error:', err.message);
    res.status(500).json({ error: 'Classification failed', details: err.message });
  }
});

export default router;
