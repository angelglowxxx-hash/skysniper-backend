// ==UserScript==
// @name         SkySniper Autonomous HUD
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Runs on any site, captures DOM + WebSocket + network, sends to /capture, shows HUD with prediction + commentary
// @author       Honey Baby
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 🛰️ Config
  const CAPTURE_ENDPOINT = 'https://your-backend.com/capture';
  const HUD_ID = 'skysniper-hud';

  // 🧲 Inject HUD
  function injectHUD() {
    if (document.getElementById(HUD_ID)) return;

    const hud = document.createElement('div');
    hud.id = HUD_ID;
    hud.style = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #111;
      color: #0f0;
      padding: 12px;
      font-family: monospace;
      font-size: 14px;
      z-index: 99999;
      border: 1px solid #0f0;
      border-radius: 6px;
    `;
    hud.innerHTML = '🔮 Predicting...';
    document.body.appendChild(hud);
  }

  // 📡 Send capture data
  function sendCapture(data) {
    fetch(CAPTURE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: location.href, timestamp: Date.now(), ...data })
    }).catch(console.error);
  }

  // 🕸️ DOM Capture
  function captureDOM() {
    const domSnapshot = {
      title: document.title,
      url: location.href,
      html: document.documentElement.outerHTML.slice(0, 5000) // limit size
    };
    sendCapture({ dom: domSnapshot });
  }

  // 🔌 WebSocket Hook
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);
    ws.addEventListener('message', (event) => {
      sendCapture({ wsMessage: event.data });
    });
    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;

  // 🌐 Network Hook (Fetch)
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const clone = response.clone();
    clone.text().then(body => {
      sendCapture({ fetchRequest: args[0], fetchResponse: body.slice(0, 1000) });
    });
    return response;
  };

  // 🧠 HUD Updater
  async function updateHUD() {
    try {
      const res = await fetch('https://your-backend.com/predict?site=' + encodeURIComponent(location.href));
      const { prediction, commentary } = await res.json();
      const hud = document.getElementById(HUD_ID);
      if (hud) {
        hud.innerHTML = `
          🔮 Prediction: <b>${prediction}</b><br>
          🧠 AI Says: <i>${commentary}</i>
        `;
      }
    } catch (err) {
      console.error('HUD update failed:', err);
    }
  }

  // 🚀 Init
  injectHUD();
  captureDOM();
  setInterval(updateHUD, 5000); // refresh every 5s
})();
