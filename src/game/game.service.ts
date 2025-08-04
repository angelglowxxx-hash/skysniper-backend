// src/game/game.service.ts
// -----------------------------------------------------------------------------
// Contains the core business logic for game interactions.
// -----------------------------------------------------------------------------

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { QueuesService } from '../common/queues/queues.service';
import { CaptureDataDto } from './dtos/capture.dto';
import { PredictNextDto } from './dtos/predict.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  /**
   * Logs the details of a completed game round to the database.
   * This is a "fire-and-forget" operation from the client's perspective.
   * @param data The captured round data.
   */
  async logCompletedRound(data: CaptureDataDto): Promise<void> {
    try {
      await this.prisma.predictionLog.create({
        data: {
          siteUrl: data.siteUrl,
          roundId: data.roundData.roundId,
          hash: data.roundData.hash,
          // We store the result in the 'predictionData' JSON field for consistency.
          predictionData: {
            actualResult: data.roundData.result,
          },
        },
      });
      this.logger.log(`Captured round ${data.roundData.roundId} for ${data.siteUrl}`);
    } catch (error) {
      this.logger.error(`Failed to log completed round for ${data.siteUrl}`, error.stack);
      // In a real system, we might push this to a SystemAlert.
    }
  }

  /**
   * Adds a prediction job to the AI queue.
   * @param data The data needed to make a prediction.
   * @returns The ID of the queued job.
   */
  async queuePredictionJob(data: PredictNextDto): Promise<string | number> {
    const job = await this.queuesService.addAiJob({
      jobType: 'prediction',
      payload: data, // Pass the entire DTO as the payload.
    });
    this.logger.log(`Queued prediction job for ${data.siteUrl}. Job ID: ${job.id}`);
    return job.id;
  }
}
