// src/admin/admin.service.ts
// -----------------------------------------------------------------------------
// This service is the brain of the Command & Control Center. It aggregates
// diagnostics, fingerprints, and system alerts into a comprehensive status report.
// -----------------------------------------------------------------------------

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { QueuesService } from '../common/queues/queues.service';
import { PushConfigDto } from './dtos/push-config.dto';
import { SiteFingerprint } from '@prisma/client';

// Define the structure for our color-coded system status.
export interface SystemStatus {
  health: 'GREEN' | 'YELLOW' | 'RED';
  message: string;
}

// Define the structure for a fingerprint that includes its health status.
export interface HealthyFingerprint extends SiteFingerprint {
  health: 'GREEN' | 'YELLOW' | 'RED';
  suggestion: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  /**
   * Gathers all necessary data and diagnostics for the main admin dashboard.
   */
  async getDashboardData() {
    const totalFingerprints = await this.prisma.siteFingerprint.count();
    const totalPredictions = await this.prisma.predictionLog.count();
    const unresolvedAlerts = await this.prisma.systemAlert.count({ where: { isRead: false } });

    // The overall system status is YELLOW if there are unresolved alerts, otherwise GREEN.
    const systemStatus: SystemStatus = {
      health: unresolvedAlerts > 0 ? 'YELLOW' : 'GREEN',
      message: unresolvedAlerts > 0 ? `${unresolvedAlerts} unresolved alerts require attention.` : 'All systems operating normally.',
    };

    const latestAlerts = await this.prisma.systemAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const fingerprints = await this.getFingerprintsWithHealth();

    return {
      stats: { totalFingerprints, totalPredictions, unresolvedAlerts },
      systemStatus,
      latestAlerts,
      fingerprints,
    };
  }

  /**
   * Retrieves all fingerprints and analyzes their health.
   * This is the core of our "self-problem detection".
   */
  async getFingerprintsWithHealth(): Promise<HealthyFingerprint[]> {
    const fingerprints = await this.prisma.siteFingerprint.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return fingerprints.map(fp => {
      let health: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
      let suggestion = 'No issues detected.';

      if (!fp.isStable) {
        health = 'YELLOW';
        suggestion = 'This site is currently undergoing AI analysis. Please wait.';
      } else if (fp.missCount > 10) {
        health = 'RED';
        suggestion = 'Selector miss count is high. The site may have been updated. Consider re-running discovery.';
      } else if (fp.missCount > 3) {
        health = 'YELLOW';
        suggestion = 'Minor selector misses detected. Monitor for further issues.';
      }

      return { ...fp, health, suggestion };
    });
  }

  /**
   * Triggers the "re-discovery" process for a stale or broken fingerprint.
   * This is our "auto-repair" feature, initiated by the admin.
   * @param fingerprintId The ID of the fingerprint to repair.
   */
  async repairFingerprint(fingerprintId: string): Promise<void> {
    const fingerprint = await this.prisma.siteFingerprint.findUnique({ where: { id: fingerprintId } });
    if (!fingerprint) {
      throw new NotFoundException(`Fingerprint with ID ${fingerprintId} not found.`);
    }

    this.logger.log(`Admin triggered repair for fingerprint: ${fingerprint.siteUrl}`);
    // For now, our repair is to reset the miss count. A more advanced version could re-queue a discovery job.
    await this.prisma.siteFingerprint.update({
      where: { id: fingerprintId },
      data: { missCount: 0, isStable: true }, // A simple repair for now.
    });
    // In an even more advanced system:
    // await this.queuesService.addAiJob({ jobType: 'discovery', payload: { siteUrl: fingerprint.siteUrl, rawDom: '...' }});
  }

  /**
   * Pushes a new UI configuration to the database.
   * @param pushConfigDto The configuration data from the admin panel.
   */
  async pushNewConfig(pushConfigDto: PushConfigDto): Promise<void> {
    const fingerprint = await this.prisma.siteFingerprint.findUnique({
      where: { siteUrl: pushConfigDto.siteUrl },
    });

    if (!fingerprint) {
      throw new NotFoundException(`Cannot push config. No fingerprint found for site: ${pushConfigDto.siteUrl}. Discover the site first.`);
    }

    await this.prisma.gameConfig.create({
      data: {
        game: pushConfigDto.game,
        config: JSON.parse(pushConfigDto.configJson), // Parse the stringified JSON from the DTO.
        fingerprintId: fingerprint.id,
      },
    });
    this.logger.log(`Admin pushed new UI config for ${pushConfigDto.game} at ${pushConfigDto.siteUrl}`);
  }
}
