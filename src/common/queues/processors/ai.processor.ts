// src/common/queues/processors/ai.processor.ts
// -----------------------------------------------------------------------------
// This is the worker that processes jobs from the 'ai-jobs' queue.
// It contains the actual logic for calling the Gemini AI.
// NOTE: THIS IS A PLACEHOLDER. We will connect this to our real services later.
// -----------------------------------------------------------------------------

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiJobData } from '../queues.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor('ai-jobs') // This decorator links the class to our 'ai-jobs' queue.
export class AiProcessor extends WorkerHost {
  constructor() {
    // We must call super() for the worker to be initialized correctly.
    super();
  }

  // This method will be called for every job added to the queue.
  async process(job: Job<AiJobData, any, string>): Promise<any> {
    console.log(`⚙️ Ai Processor: Processing job '${job.name}' with ID ${job.id}...`);
    console.log('Job Payload:', job.data.payload);

    switch (job.name) {
      case 'discovery':
        // TODO: Call the DiscoveryService to analyze the site.
        console.log('Running Discovery AI analysis...');
        // Placeholder for the slow AI call.
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return { result: 'Discovery complete for ' + job.data.payload.siteUrl };

      case 'prediction':
        // TODO: Call the GameService to get a prediction.
        console.log('Running Prediction AI analysis...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return { result: 'Prediction complete for round ' + job.data.payload.roundId };

      case 'config':
        // TODO: Call the ConfigService to generate a UI config.
        console.log('Running UI Config AI analysis...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return { result: 'UI Config generated for ' + job.data.payload.game };

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  // --- Optional: Event Listeners for logging and monitoring ---
  // on(event: 'completed', (job: Job) => {
  //   console.log(`✅ Ai Processor: Job ${job.id} of type ${job.name} has completed.`);
  // });

  // on(event: 'failed', (job: Job, err: Error) => {
  //   console.error(`❌ Ai Processor: Job ${job.id} of type ${job.name} has failed with error: ${err.message}`);
  // });
}
