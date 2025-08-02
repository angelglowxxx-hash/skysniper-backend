// SkySniper — utils/diagnostics.js
// 🧪 Backend diagnostics overlay for admin panel and health checks

export async function getDiagnostics() {
  return {
    uptime: process.uptime(), // seconds since server started
    memory: process.memoryUsage(), // heap, RSS, external
    routes: [
      "capture",
      "predict",
      "syncRound",
      "status",
      "gameConfig",
      "admin"
    ],
    timestamp: new Date().toISOString()
  };
}
