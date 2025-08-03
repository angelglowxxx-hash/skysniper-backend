// adminView.js 🧠 SkySniper Admin Templates

export const adminHTML = {
  // 🔐 Login Page (Black-Red Premium)
  loginForm: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>SkySniper Admin Login</title>
      <style>
        body {
          background: #000;
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        form {
          background: #111;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 0 20px #ff0055;
        }
        input, button {
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 4px;
          border: none;
        }
        input {
          background: #222;
          color: #fff;
        }
        button {
          background: #ff0055;
          color: #fff;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <form method="POST" action="/login">
        <h2>🔐 Admin Login</h2>
        <input name="token" type="password" placeholder="Admin Token" required />
        <button type="submit">Login</button>
      </form>
    </body>
    </html>
  `,

  // 🧠 Admin Panel (Live AI Dashboard)
  panel: ({ fps, rds, diagnostics }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>SkySniper Admin Panel</title>
      <style>
        body {
          background-color: #0f0f0f;
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
          padding: 2rem;
        }
        h1, h2 {
          color: #ff0055;
        }
        section {
          margin-bottom: 2rem;
          border-bottom: 1px solid #333;
          padding-bottom: 1rem;
        }
        input, button {
          padding: 0.5rem;
          margin-right: 0.5rem;
          border-radius: 4px;
        }
        input {
          background: #1a1a1a;
          border: 1px solid #444;
          color: #fff;
        }
        button {
          background: #ff0055;
          border: none;
          color: #fff;
          cursor: pointer;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          margin-bottom: 1rem;
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 6px;
        }
        pre {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
        }
        .empty {
          color: #888;
          font-style: italic;
        }
        .flash {
          background: #055;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <h1>🧠 SkySniper Admin Panel</h1>
      <p><small>${diagnostics.timestamp}</small></p>

      <section>
        <h2>🌐 Live Casino Platforms (AI Curated)</h2>
        <ul>
          ${[
            "Stake.com",
            "1xBet",
            "Betway",
            "Parimatch",
            "Bet365",
            "Fairplay",
            "JeetWin",
            "WinDaddy",
            "Fun88",
            "Rajabets",
            "LeoVegas",
            "22Bet",
            "MostBet",
            "SkyExchange",
            "Dafabet",
            "Bettilt",
            "Crickex",
            "Indibet",
            "BetBarter",
            "BetIndi"
          ].map(site => `<li>🎰 ${site}</li>`).join('')}
        </ul>
        <p><em>Auto-updated via AI. Only verified, working platforms shown.</em></p>
      </section>

      <section>
        <h2>🔍 Fingerprints</h2>
        ${fps.length
          ? `<ul>${fps.map(fp => `
              <li>
                <strong>Site:</strong> ${fp.site_url}<br />
                <strong>Game:</strong> ${fp.game || 'N/A'}<br />
                <strong>Modules:</strong> ${(fp.modules || []).join(', ') || 'None'}
              </li>`).join('')}</ul>`
          : `<p class="empty">No fingerprints found.</p>`}
      </section>

      <section>
        <h2>🎯 Push Config via AI</h2>
        <form method="POST" action="/admin/pushConfig">
          <input name="site_url" placeholder="Site URL" required />
          <input name="game" placeholder="Game Name" required />
          <button type="submit">Push Config</button>
        </form>
      </section>

      <section>
        <h2>📊 Latest Predictions</h2>
        ${rds.length
          ? `<ul>${rds.map(r => `
              <li>
                <strong>Round:</strong> ${r.round_id}<br />
                <strong>Prediction:</strong> ${r.next_prediction || '–'}<br />
                <strong>Tag:</strong> ${r.tag || '–'}
              </li>`).join('')}</ul>`
          : `<p class="empty">No predictions available.</p>`}
      </section>

      <section>
        <h2>🧪 System Diagnostics</h2>
        <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
      </section>
    </body>
    </html>
  `
}
