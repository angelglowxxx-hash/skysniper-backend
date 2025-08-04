// src/views/views.service.ts
// -----------------------------------------------------------------------------
// This service is a server-side HTML templating engine. It generates the
// dynamic HTML for the admin panel using data passed from the AdminService.
// -----------------------------------------------------------------------------

import { Injectable } from '@nestjs/common';
import { AdminDashboardData } from '../admin/admin.service'; // We will define this type in AdminService

// Define a helper type for the data we expect.
type DashboardData = Awaited<ReturnType<AdminDashboardData['getDashboardData']>>;

@Injectable()
export class ViewsService {

  // --- THE MAIN CSS STYLESHEET ---
  private getStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        :root {
          --bg-main: #111827; --bg-card: #1F2937; --border-color: #374151;
          --text-main: #F9FAFB; --text-light: #9CA3AF; --text-premium: #FBBF24;
          --color-green: #22C55E; --color-yellow: #F59E0B; --color-red: #EF4444;
          --font-family: 'Inter', sans-serif;
        }
        body { margin: 0; font-family: var(--font-family); background: var(--bg-main); color: var(--text-main); font-size: 14px; }
        .container { max-width: 1600px; margin: 2rem auto; padding: 0 2rem; }
        .header { border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 2rem; }
        .header h1 { font-size: 2rem; color: var(--text-premium); margin: 0; }
        .header h1 span { font-weight: 400; color: var(--text-main); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
        .card { background: var(--bg-card); border-radius: 0.75rem; padding: 1.5rem; border: 1px solid var(--border-color); }
        .card h2 { margin-top: 0; font-size: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;}
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center; }
        .stat-item h3 { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: var(--text-premium); }
        .stat-item p { margin: 0; color: var(--text-light); }
        .status-bar { padding: 1rem; border-radius: 0.5rem; font-weight: 600; }
        .status-GREEN { background: rgba(34, 197, 94, 0.1); color: var(--color-green); border: 1px solid var(--color-green); }
        .status-YELLOW { background: rgba(245, 158, 11, 0.1); color: var(--color-yellow); border: 1px solid var(--color-yellow); }
        .status-RED { background: rgba(239, 68, 68, 0.1); color: var(--color-red); border: 1px solid var(--color-red); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        th { color: var(--text-light); }
        .dot { height: 10px; width: 10px; border-radius: 50%; display: inline-block; margin-right: 0.5rem; }
        .dot-GREEN { background-color: var(--color-green); }
        .dot-YELLOW { background-color: var(--color-yellow); }
        .dot-RED { background-color: var(--color-red); }
        .premium { color: var(--text-premium); font-weight: 600; }
        .suggestion { font-style: italic; color: var(--text-light); font-size: 12px; }
      </style>
    `;
  }

  // --- THE LOGIN PAGE ---
  public getLoginPage(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>SkySniper X | Login</title>${this.getStyles()}
        <style>
          body { display: flex; align-items: center; justify-content: center; height: 100vh; }
          form { display: flex; flex-direction: column; gap: 1rem; width: 320px; }
          input { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.75rem; border-radius: 0.5rem; font-size: 1rem; }
          button { background: var(--text-premium); color: var(--bg-main); border: none; padding: 0.75rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 700; cursor: pointer; }
        </style>
      </head>
      <body>
        <form action="/login" method="post">
          <h1 class="premium">SkySniper X <span>Login</span></h1>
          <input type="password" name="token" placeholder="Enter Admin Token" required>
          <button type="submit">Access Command Center</button>
        </form>
      </body>
      </html>
    `;
  }

  // --- THE MAIN DASHBOARD PAGE ---
  public getDashboardPage(data: DashboardData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>SkySniper X | Command Center</title>${this.getStyles()}
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1><span class="premium">SkySniper X</span> Command Center</h1>
          </header>
          
          <div class="grid">
            <!-- Stats Card -->
            <div class="card">
              <h2>System Overview</h2>
              <div class="stat-grid">
                <div class="stat-item">
                  <h3>${data.stats.totalFingerprints}</h3>
                  <p>Sites Learned</p>
                </div>
                <div class="stat-item">
                  <h3>${data.stats.totalPredictions}</h3>
                  <p>Predictions Logged</p>
                </div>
                <div class="stat-item">
                  <h3 class="${data.stats.unresolvedAlerts > 0 ? 'premium' : ''}">${data.stats.unresolvedAlerts}</h3>
                  <p>Active Alerts</p>
                </div>
              </div>
            </div>

            <!-- Status Card -->
            <div class="card">
              <h2>System Status</h2>
              <div class="status-bar status-${data.systemStatus.health}">
                ${data.systemStatus.message}
              </div>
            </div>
            
            <!-- Alerts Card -->
            <div class="card">
                <h2>Latest System Alerts</h2>
                <table>
                    <thead><tr><th>Type</th><th>Message</th></tr></thead>
                    <tbody>
                        ${data.latestAlerts.map(alert => `
                            <tr>
                                <td><span class="premium">${alert.type}</span></td>
                                <td>${alert.message}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Fingerprints Card -->
            <div class="card" style="grid-column: 1 / -1;">
              <h2>Site Fingerprints Command</h2>
              <table>
                <thead><tr><th>Health</th><th>Site URL</th><th>Game Type</th><th>Misses</th><th>Suggestion & Actions</th></tr></thead>
                <tbody>
                  ${data.fingerprints.map(fp => `
                    <tr>
                      <td><span class="dot dot-${fp.health}"></span>${fp.health}</td>
                      <td>${fp.siteUrl}</td>
                      <td>${fp.gameType || 'N/A'}</td>
                      <td class="${fp.missCount > 0 ? 'premium' : ''}">${fp.missCount}</td>
                      <td>
                        <p class="suggestion">${fp.suggestion}</p>
                        ${fp.health === 'RED' ? `<button onclick="repair('${fp.id}')">Repair Now</button>` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <script>
            async function repair(id) {
                if (!confirm('Are you sure you want to attempt to repair fingerprint ' + id + '?')) return;
                const response = await fetch('/admin/fingerprints/' + id + '/repair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    alert('Repair initiated successfully! Reloading...');
                    location.reload();
                } else {
                    alert('Repair failed!');
                }
            }
        </script>
      </body>
      </html>
    `;
  }
}
