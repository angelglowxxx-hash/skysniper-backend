// src/common/queues/queues.module.ts (DEFINITIVE, CORRECTED)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueuesService } from './queues.service';
import { AiProcessor } from './processors/ai.processor';
import { parse } from 'redis-url'; // Import the parser

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is not configured');
        }

        // FIX: Parse the Redis URL into the host, port, and password components
        // that BullMQ's ConnectionOptions object expects.
        const { host, port, password } = parse(redisUrl);

        return {
          connection: {
            host: host || 'localhost',
            port: port ? parseInt(port, 10) : 6379,
            password: password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'ai-jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    }),
  ],
  providers: [QueuesService, AiProcessor],
  exports: [QueuesService],
})
export class QueuesModule {}