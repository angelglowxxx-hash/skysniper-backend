// SkySniper — utils/fingerprintBuilder.js
// 🧠 Captures DOM + network fingerprint and stores in Supabase

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;

/**
 * Store fingerprint for a site/game
 * @param {Object} data - { site_url, game, hash, url }
 */
export async function storeFingerprint({ site_url, game, hash, url }) {
  try {
    const dom_signature = {
      title: ".game-title, .game-name",
      round: ".round-id, .round-number",
      hash: ".hash, .server-seed",
      multiplier: ".multiplier, .crash-value",
      result: ".result, .crash-result"
    };

    const network_patterns = ["/round", "/crash", "/game"];
    const modules = ["prediction", "hashVerifier", "trendGraph"];

    const payload = {
      site_url,
      game,
      dom_signature,
      network_patterns,
      modules,
      last_seen: new Date().toISOString()
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_fingerprints`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    return res.ok ? result : { error: "Fingerprint insert failed", details: result };
  } catch (err) {
    console.error("❌ Fingerprint error:", err.message);
    return { error: "Fingerprint error", details: err.message };
  }
}
