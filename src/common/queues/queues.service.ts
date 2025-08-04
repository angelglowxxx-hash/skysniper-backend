// src/common/queues/queues.service.ts
// -----------------------------------------------------------------------------
// This service provides a simple interface for adding jobs to our queues.
// It abstracts away the BullMQ-specific syntax.
// -----------------------------------------------------------------------------

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// Define the structure of the data for our AI jobs.
export interface AiJobData {
  jobType: 'discovery' | 'prediction' | 'config';
  payload: any;
}

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('ai-jobs') private readonly aiJobsQueue: Queue,
  ) {}

  /**
   * Adds a new job to the AI processing queue.
   * @param data The data for the AI job, specifying the type and payload.
   */
  async addAiJob(data: AiJobData): Promise<void> {
    await this.aiJobsQueue.add(data.jobType, data);
    console.log(`⚪️ Queues Service: Added '${data.jobType}' job to the queue.`);
  }
}
