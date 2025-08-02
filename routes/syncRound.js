// SkySniper — routes/syncRound.js
// ☁️ Syncs round data to Supabase

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post("/", async (req, res) => {
  const roundData = req.body;

  if (!roundData || typeof roundData !== "object") {
    return res.status(400).json({ error: "Invalid round data" });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rounds`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(roundData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Supabase sync failed");
    }

    res.json({
      success: true,
      synced: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Supabase sync error:", err.message);
    res.status(500).json({
      error: "Sync failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
