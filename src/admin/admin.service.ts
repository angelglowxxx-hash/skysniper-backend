// src/admin/admin.service.ts (Corrected)
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { QueuesService } from '../common/queues/queues.service';
import { PushConfigDto } from './dtos/push-config.dto';
import { SiteFingerprint, SystemAlert } from '@prisma/client';

export interface SystemStatus {
  health: 'GREEN' | 'YELLOW' | 'RED';
  message: string;
}

export interface HealthyFingerprint extends SiteFingerprint {
  health: 'GREEN' | 'YELLOW' | 'RED';
  suggestion: string;
}

// FIX: Export this type so other modules can use it.
export type AdminDashboardData = Awaited<ReturnType<AdminService['getDashboardData']>>;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  async getDashboardData() {
    const totalFingerprints = await this.prisma.siteFingerprint.count();
    const totalPredictions = await this.prisma.predictionLog.count();
    const unresolvedAlerts = await this.prisma.systemAlert.count({ where: { isRead: false } });

    const systemStatus: SystemStatus = {
      health: unresolvedAlerts > 0 ? 'YELLOW' : 'GREEN',
      message: unresolvedAlerts > 0 ? `${unresolvedAlerts} unresolved alerts require attention.` : 'All systems operating normally.',
    };

    const latestAlerts: SystemAlert[] = await this.prisma.systemAlert.findMany({
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

  async getFingerprintsWithHealth(): Promise<HealthyFingerprint[]> {
    const fingerprints = await this.prisma.siteFingerprint.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return fingerprints.map((fp): HealthyFingerprint => {
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

  async repairFingerprint(fingerprintId: string): Promise<void> {
    const fingerprint = await this.prisma.siteFingerprint.findUnique({ where: { id: fingerprintId } });
    if (!fingerprint) {
      throw new NotFoundException(`Fingerprint with ID ${fingerprintId} not found.`);
    }
    this.logger.log(`Admin triggered repair for fingerprint: ${fingerprint.siteUrl}`);
    await this.prisma.siteFingerprint.update({
      where: { id: fingerprintId },
      data: { missCount: 0, isStable: true },
    });
  }

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
        config: JSON.parse(pushConfigDto.configJson),
        fingerprintId: fingerprint.id,
      },
    });
    this.logger.log(`Admin pushed new UI config for ${pushConfigDto.game} at ${pushConfigDto.siteUrl}`);
  }
}