// SkySniper — decode.js v1.0
// 🔐 Decodes hash received from extension via POST

import express from 'express';
const router = express.Router();

// 🧠 Your custom hash decoding logic
function decodeHash(hash) {
  // Example: decode Aviator-style hash (provably fair)
  try {
    const seed = hash.slice(0, 32); // Just a mock example
    const multiplier = parseFloat((100 / (1 + parseInt(seed, 16) % 100)).toFixed(2));
    return multiplier;
  } catch (err) {
    return null;
  }
}

// 🔁 POST /decode
router.post('/decode', async (req, res) => {
  const { hash } = req.body;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: "Invalid hash" });
  }

  const decoded = decodeHash(hash);

  if (decoded === null) {
    return res.status(500).json({ error: "Failed to decode hash" });
  }

  return res.json({ decoded });
});

export default router;
