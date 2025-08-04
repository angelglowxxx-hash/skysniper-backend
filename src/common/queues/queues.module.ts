// src/common/queues/queues.module.ts (Correct Code)

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueuesService } from './queues.service';
import { AiProcessor } from './processors/ai.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is not configured in environment variables.');
        }
        return {
          connection: redisUrl,
        };
      },
    }),
    BullModule.registerQueue({
      name: 'ai-jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    }),
  ],
  providers: [QueuesService, AiProcessor],
  exports: [QueuesService],
})
export class QueuesModule {}