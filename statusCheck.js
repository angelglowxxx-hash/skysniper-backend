// SkySniper — statusCheck.js v1.0
// 🔍 Checks backend health and sync status

import { config } from './configLoader.js';

export async function checkBackendStatus() {
  try {
    const res = await fetch(config.SYNC_ENDPOINT + "/status", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Backend not responding");

    const data = await res.json();

    return {
      online: true,
      uptime: data.uptime || "unknown",
      syncedRounds: data.syncedRounds || 0,
      lastSync: data.lastSync || "N/A"
    };
  } catch (err) {
    console.warn("❌ Backend health check failed:", err.message);
    return {
      online: false,
      uptime: "offline",
      syncedRounds: 0,
      lastSync: "N/A"
    };
  }
}
