// SkySniper — routes/decode.js
// 🔐 Decodes hash into crash multiplier using hashDecoder.js

import express from 'express';
import { decodeHash } from '../utils/hashDecoder.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const { hash } = req.body;

  if (!hash || typeof hash !== "string") {
    return res.status(400).json({
      error: "Missing or invalid hash",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = decodeHash(hash);

    if (!decoded || decoded === "Invalid hash") {
      throw new Error("Hash decoding failed");
    }

    res.json({
      decoded,
      hash,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Decode error:", err.message);
    res.status(500).json({
      error: "Decode failed",
      details: err.message,
      hash,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
