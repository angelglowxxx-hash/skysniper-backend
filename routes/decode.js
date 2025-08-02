// SkySniper — routes/decode.js
// 🔐 Handles hash decoding requests

import express from 'express';
const router = express.Router();

// Placeholder decode logic (replace with real algorithm later)
function decodeHash(hash) {
  if (!hash || typeof hash !== "string") return null;

  // Simulate decoding logic — replace with actual provably fair algorithm
  const fakeMultiplier = (Math.random() * 2 + 1).toFixed(2); // e.g. 1.00x to 3.00x
  return `${fakeMultiplier}x`;
}

router.post("/", async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ error: "Missing hash" });
  }

  try {
    const decoded = decodeHash(hash);
    if (!decoded) throw new Error("Decode failed");

    res.json({ decoded });
  } catch (err) {
    console.error("❌ Decode error:", err.message);
    res.status(500).json({
      error: "Decode failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
