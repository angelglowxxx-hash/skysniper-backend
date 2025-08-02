const statusEl = document.getElementById('status');
const logsEl = document.getElementById('logs');

// Fetch status
async function fetchStatus() {
  const res = await fetch('/dashboard-api/status');
  const data = await res.json();
  statusEl.innerHTML = `
    <b>Status:</b> ${data.status} <br>
    <b>Uptime:</b> ${Math.floor(data.uptime/60)} min <br>
    <b>Model:</b> ${data.env.AI_MODEL_NAME} <br>
    <b>Supabase:</b> ${data.env.SUPABASE_URL}
  `;
}
fetchStatus();
setInterval(fetchStatus, 10000);

// Fetch logs
async function fetchLogs() {
  const res = await fetch('/dashboard-api/logs');
  const data = await res.json();
  logsEl.textContent = data.logs.map(
    l => `[${l.time}] ${l.method} ${l.url} (${l.ip})`
  ).reverse().join('\n');
}
fetchLogs();
setInterval(fetchLogs, 5000);

// Live logs via socket.io
const socket = io();
socket.on("api_log", log => {
  fetchLogs();
});
