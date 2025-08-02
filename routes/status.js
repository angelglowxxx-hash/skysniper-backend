// SkySniper — routes/status.js
// 🛰️ Backend health check + Supabase ping + diagnostics overlay

import express from 'express';
import fetch from 'node-fetch';
import { getDiagnostics } from '../utils/diagnostics.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // ✅ Fetch round count from Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rounds?select=count`, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`
      }
    });

    const countHeader = response.headers.get("content-range"); // e.g. 0-0/42
    const totalRounds = countHeader?.split("/")?.[1] || "unknown";

    // ✅ Get backend diagnostics
    const diagnostics = await getDiagnostics();

    res.json({
      online: true,
      syncedRounds: totalRounds,
      diagnostics,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Status check failed:", err.message);
    res.status(500).json({
      online: false,
      error: "Supabase unreachable",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
