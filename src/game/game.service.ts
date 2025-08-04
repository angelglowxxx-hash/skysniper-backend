// src/game/game.service.ts (Corrected)
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { QueuesService } from '../common/queues/queues.service';
import { CaptureDataDto } from './dtos/capture.dto';
import { PredictNextDto } from './dtos/predict.dto';
import { Job } from 'bullmq';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  async logCompletedRound(data: CaptureDataDto): Promise<void> {
    try {
      await this.prisma.predictionLog.create({
        data: {
          siteUrl: data.siteUrl,
          roundId: data.roundData.roundId,
          hash: data.roundData.hash,
          predictionData: {
            actualResult: data.roundData.result,
          },
        },
      });
      this.logger.log(`Captured round ${data.roundData.roundId} for ${data.siteUrl}`);
    } catch (error) {
      // FIX: Check if error is an instance of Error before accessing .stack
      if (error instanceof Error) {
        this.logger.error(`Failed to log completed round for ${data.siteUrl}`, error.stack);
      } else {
        this.logger.error(`Failed to log completed round for ${data.siteUrl}`, error);
      }
    }
  }

  async queuePredictionJob(data: PredictNextDto): Promise<Job> { // FIX: Return the Job object
    const job = await this.queuesService.addAiJob({
      jobType: 'prediction',
      payload: data,
    });
    this.logger.log(`Queued prediction job for ${data.siteUrl}. Job ID: ${job.id}`);
    return job; // FIX: Return the entire job
  }
}