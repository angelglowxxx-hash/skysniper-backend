-- 🔍 Site Classification Table
CREATE TABLE IF NOT EXISTS site_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL,
  type TEXT CHECK (type IN ('casino', 'crash_game', 'other')),
  confidence TEXT,
  modules TEXT[],
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 Prediction Logs Table
CREATE TABLE IF NOT EXISTS prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL,
  round_id TEXT NOT NULL,
  hash TEXT,
  predicted_multiplier FLOAT,
  actual_multiplier FLOAT,
  decoded_hash TEXT,
  crash_point FLOAT,
  tag TEXT,
  commentary TEXT,
  confidence TEXT,
  prediction_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🧠 UI State Table (optional if caching HUD state)
CREATE TABLE IF NOT EXISTS ui_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL,
  round_id TEXT NOT NULL,
  state TEXT CHECK (state IN ('loading', 'ready', 'error')),
  message TEXT,
  commentary TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
