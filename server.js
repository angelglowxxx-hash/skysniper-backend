// ✅ /capture (POST)
app.post("/capture", async (req, res) => {
  const { site_url, dom_signature, network_patterns } = req.body;
  console.log("📡 Fingerprint received:", site_url);
  res.json({ status: "ok", received: true });
});

// ✅ /predict (POST)
app.post("/predict", async (req, res) => {
  const { round_id, hash, latestMultiplier, pattern } = req.body;
  console.log("🔮 Predict request:", round_id);
  res.json({
    next_prediction: "2.15",
    tag: "safe",
    pattern: [1.8, 2.0, 2.15]
  });
});

// ✅ /uiState (GET)
app.get("/uiState", async (req, res) => {
  const { round_id, site_url } = req.query;
  console.log("🧠 UI state for:", round_id);
  res.json({
    state: "ready",
    commentary: "AI confident in next round"
  });
});

// ✅ /gameConfig (GET)
app.get("/gameConfig", async (req, res) => {
  const { site_url } = req.query;
  console.log("🧩 Config for:", site_url);
  res.json({
    layout: "default",
    theme: "dark",
    modules: ["prediction", "hashVerifier", "trendGraph"]
  });
});
