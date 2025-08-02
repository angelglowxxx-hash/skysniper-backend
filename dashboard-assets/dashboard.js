const statusEl = document.getElementById('status');
const logsEl = document.getElementById('logs');
const errorsEl = document.getElementById('errors');
const envEl = document.getElementById('env');
const aiSuggestionsEl = document.getElementById('aiSuggestions');

// Status fetch
async function fetchStatus() {
  const res = await fetch('/dashboard-api/status');
  const data = await res.json();
  statusEl.innerHTML = `
    <b>Status:</b> ${data.status} <br>
    <b>Uptime:</b> ${Math.floor(data.uptime/60)} min<br>
    <b>Model:</b> ${data.env.AI_MODEL_NAME} <br>
    <b>Supabase:</b> ${data.env.SUPABASE_URL}
  `;
  envEl.textContent = JSON.stringify(data.env, null, 2);
}
fetchStatus();
setInterval(fetchStatus, 15000);

// Logs fetch
async function fetchLogs() {
  const res = await fetch('/dashboard-api/logs');
  const data = await res.json();
  logsEl.textContent = data.logs.map(
    l => `[${l.time}] ${l.method} ${l.url} (${l.ip})`
  ).reverse().join('\n');
}
fetchLogs();
setInterval(fetchLogs, 7000);

// Errors fetch
async function fetchErrors() {
  const res = await fetch('/dashboard-api/errors');
  const data = await res.json();
  errorsEl.textContent = data.errors.map(
    e => `[${e.time}] ${e.url} - ${e.message}\n${e.stack || ''}`
  ).reverse().join('\n\n');
  // Show last error in AI panel as demo
  if (data.errors.length)
    aiSuggestionsEl.textContent = `AI Suggestion: Check logic at ${data.errors[data.errors.length-1].url}\n${data.errors[data.errors.length-1].message}`;
}
fetchErrors();
setInterval(fetchErrors, 9000);

// Live logs/errors via socket.io
const socket = io();
socket.on("api_log", log => fetchLogs());
socket.on("api_error", err => fetchErrors());

// API Tester
const apiForm = document.getElementById('apiForm');
const apiResult = document.getElementById('apiResult');
apiForm.onsubmit = async (e) => {
  e.preventDefault();
  apiResult.textContent = "Loading...";
  const endpoint = document.getElementById('apiEndpoint').value;
  const method = document.getElementById('apiMethod').value;
  let body = document.getElementById('apiBody').value;
  try {
    let options = { method, headers: { 'Content-Type': 'application/json' }};
    if (method === "POST" && body.trim() !== "") options.body = body;
    const res = await fetch(endpoint, options);
    const text = await res.text();
    apiResult.textContent = text;
  } catch (err) {
    apiResult.textContent = "Failed: " + err.message;
  }
};
