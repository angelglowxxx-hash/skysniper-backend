// src/common/queues/queues.module.ts
// -----------------------------------------------------------------------------
// This module sets up the BullMQ job queue system, powered by Redis.
// It registers the queue and connects the processor that will handle the jobs.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueuesService } from './queues.service';
import { AiProcessor } from './processors/ai.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      // Use a factory to dynamically configure the Redis connection from env variables.
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    // Register the specific queue we will be using. We can add more queues here if needed.
    BullModule.registerQueue({
      name: 'ai-jobs', // The name of our queue for all AI-related tasks.
      defaultJobOptions: {
        attempts: 3, // Retry a failed job up to 3 times.
        backoff: {
          type: 'exponential', // Use exponential backoff for retries (e.g., 1s, 2s, 4s).
          delay: 1000,
        },
        removeOnComplete: true, // Automatically remove jobs when they complete successfully.
        removeOnFail: 1000, // Keep failed jobs for 1000 seconds for inspection.
      },
    }),
  ],
  providers: [
    QueuesService, // The service to add jobs to the queue.
    AiProcessor, // The processor that will handle the jobs.
  ],
  exports: [
    QueuesService, // Export the service so other modules can add jobs.
  ],
})
export class QueuesModule {}
