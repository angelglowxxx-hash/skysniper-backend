// src/common/queues/queues.service.ts (Corrected)
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';

export interface AiJobData {
  jobType: 'discovery' | 'prediction' | 'config';
  payload: any;
}

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('ai-jobs') private readonly aiJobsQueue: Queue) {}

  async addAiJob(data: AiJobData): Promise<Job> { // FIX: Return type is Job
    const job = await this.aiJobsQueue.add(data.jobType, data);
    console.log(`⚪️ Queues Service: Added '${data.jobType}' job to the queue.`);
    return job; // FIX: Return the job object
  }
}