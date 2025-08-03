// SkySniper — admin/panel.js
// 🧠 Push UI config per site, toggle modules/themes/stealth, show live prediction + diagnostics

import express from 'express';
import { supabase } from '../supabase/client.js';

const router = express.Router();

// 🔧 GET /panel/config?site_url=example.com
router.get('/config', async (req, res) => {
  const { site_url } = req.query;
  if (!site_url) return res.status(400).json({ error: 'Missing site_url' });

  try {
    // 🧩 Get current config
    const { data: config, error } = await supabase
      .from('site_classifications')
      .select('*')
      .eq('site_url', site_url)
      .single();

    if (error || !config) throw error;

    res.json({
      site_url,
      type: config.type,
      confidence: config.confidence,
      modules: config.modules,
      stealth: config.stealth || false,
      theme: config.theme || 'dark'
    });
  } catch (err) {
    console.error('❌ Config fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch config', details: err.message });
  }
});

// 🚀 POST /panel/pushConfig
router.post('/pushConfig', async (req, res) => {
  const { site_url, modules, theme, stealth } = req.body;
  if (!site_url || !modules) return res.status(400).json({ error: 'Missing site_url or modules' });

  try {
    const { data, error } = await supabase
      .from('site_classifications')
      .upsert({
        site_url,
        modules,
        theme,
        stealth,
        last_checked: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ status: 'updated', config: { site_url, modules, theme, stealth } });
  } catch (err) {
    console.error('❌ Config push error:', err.message);
    res.status(500).json({ error: 'Push failed', details: err.message });
  }
});

// 📊 GET /panel/diagnostics?site_url=example.com
router.get('/diagnostics', async (req, res) => {
  const { site_url } = req.query;
  if (!site_url) return res.status(400).json({ error: 'Missing site_url' });

  try {
    const { data: predictions } = await supabase
      .from('prediction_logs')
      .select('*')
      .eq('site_url', site_url)
      .order('created_at', { ascending: false })
      .limit(10);

    const errors = predictions.filter(p => p.tag === 'error' || p.commentary?.includes('fail'));
    const tips = errors.map(e => ({
      round_id: e.round_id,
      issue: e.commentary,
      suggestion: 'Check fingerprint or hash format'
    }));

    res.json({
      site_url,
      recent_predictions: predictions,
      error_logs: errors,
      repair_suggestions: tips
    });
  } catch (err) {
    console.error('❌ Diagnostics error:', err.message);
    res.status(500).json({ error: 'Diagnostics failed', details: err.message });
  }
});

export default router;
