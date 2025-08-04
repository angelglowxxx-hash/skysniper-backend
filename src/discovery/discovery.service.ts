// src/discovery/discovery.service.ts
// -----------------------------------------------------------------------------
// This service contains the core logic for the site discovery process.
// It interacts with the database and adds jobs to the AI queue.
// -----------------------------------------------------------------------------

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { QueuesService } from '../common/queues/queues.service';
import { SiteFingerprint } from '@prisma/client';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  /**
   * Initiates the discovery process for a new or existing site.
   * @param siteUrl The URL of the site to analyze.
   * @param rawDom A stringified snapshot of the site's DOM.
   */
  async initiateDiscovery(siteUrl: string, rawDom: string): Promise<SiteFingerprint> {
    try {
      // Step 1: Check if a fingerprint already exists for this site.
      // If it exists, we update it. If not, we create a new one.
      const fingerprint = await this.prisma.siteFingerprint.upsert({
        where: { siteUrl },
        update: {
          // If we're re-discovering, mark it as not stable until analysis is complete.
          isStable: false,
          updatedAt: new Date(),
        },
        create: {
          siteUrl,
          isStable: false, // It's not stable until the AI has analyzed it.
        },
      });

      console.log(`⚪️ Discovery Service: Upserted fingerprint for ${siteUrl}.`);

      // Step 2: Add a job to the 'ai-jobs' queue for background processing.
      // We pass the fingerprint ID and the raw DOM data to the processor.
      await this.queuesService.addAiJob({
        jobType: 'discovery',
        payload: {
          fingerprintId: fingerprint.id,
          rawDom,
        },
      });

      return fingerprint;
    } catch (error) {
      console.error(`🔴 Discovery Service: Failed to initiate discovery for ${siteUrl}.`, error);
      // We can also log this error to our SystemAlerts table in a real scenario.
      throw new InternalServerErrorException('Could not start the discovery process.');
    }
  }
}
