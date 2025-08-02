// SkySniper — utils/dbClient.js
// ☁️ Supabase client for syncing rounds, querying fingerprints, pushing configs

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

/**
 * Sync a round to Supabase
 */
export async function syncRound(roundData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rounds`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(roundData)
    });
    const result = await res.json();
    return res.ok ? result : { error: "Sync failed", details: result };
  } catch (err) {
    console.error("❌ Supabase sync error:", err.message);
    return { error: "Sync failed", details: err.message };
  }
}

/**
 * Get recent rounds (limit 10)
 */
export async function getRecentRounds(limit = 10) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rounds?order=timestamp.desc&limit=${limit}`, {
      method: "GET",
      headers
    });
    const data = await res.json();
    return res.ok ? data : { error: "Fetch failed", details: data };
  } catch (err) {
    console.error("❌ Supabase fetch error:", err.message);
    return { error: "Fetch failed", details: err.message };
  }
}

/**
 * Get total round count
 */
export async function getRoundCount() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rounds?select=count`, {
      method: "GET",
      headers
    });
    const range = res.headers.get("content-range");
    const count = range?.split("/")?.[1] || "unknown";
    return count;
  } catch (err) {
    console.error("❌ Supabase count error:", err.message);
    return "unknown";
  }
}

/**
 * Get all stored fingerprints
 */
export async function getFingerprints() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_fingerprints`, {
      method: "GET",
      headers
    });
    return await res.json();
  } catch (err) {
    console.error("❌ getFingerprints error:", err.message);
    return [];
  }
}

/**
 * Push new config for a site/game
 */
export async function updateConfig(site_url, config) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_configs`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        site_url,
        config,
        updated_at: new Date().toISOString()
      })
    });
    return await res.json();
  } catch (err) {
    console.error("❌ updateConfig error:", err.message);
    return { error: err.message };
  }
}

/**
 * Get latest prediction rounds (for admin panel)
 */
export async function getLatestRounds(limit = 10) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/predictions?order=timestamp.desc&limit=${limit}`, {
      method: "GET",
      headers
    });
    return await res.json();
  } catch (err) {
    console.error("❌ getLatestRounds error:", err.message);
    return [];
  }
}
