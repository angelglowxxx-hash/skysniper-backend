// src/views/views.service.ts (Corrected)
import { Injectable } from '@nestjs/common';
import { AdminDashboardData, HealthyFingerprint } from '../admin/admin.service';
import { SystemAlert } from '@prisma/client';

@Injectable()
export class ViewsService {
  private getStyles(): string {
    // ... (CSS code remains the same, no changes needed here)
    return `...`;
  }
  
  public getLoginPage(): string {
    // ... (Login page HTML remains the same)
    return `...`;
  }

  public getDashboardPage(data: AdminDashboardData): string {
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

            <div class="card">
              <h2>System Status</h2>
              <div class="status-bar status-${data.systemStatus.health}">
                ${data.systemStatus.message}
              </div>
            </div>
            
            <div class="card">
                <h2>Latest System Alerts</h2>
                <table>
                    <thead><tr><th>Type</th><th>Message</th></tr></thead>
                    <tbody>
                        ${data.latestAlerts.map((alert: SystemAlert) => `
                            <tr>
                                <td><span class="premium">${alert.type}</span></td>
                                <td>${alert.message}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="card" style="grid-column: 1 / -1;">
              <h2>Site Fingerprints Command</h2>
              <table>
                <thead><tr><th>Health</th><th>Site URL</th><th>Game Type</th><th>Misses</th><th>Suggestion & Actions</th></tr></thead>
                <tbody>
                  ${data.fingerprints.map((fp: HealthyFingerprint) => `
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