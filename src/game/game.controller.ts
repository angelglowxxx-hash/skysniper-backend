// src/game/game.controller.ts
// -----------------------------------------------------------------------------
// Handles all real-time API requests from the game page.
// -----------------------------------------------------------------------------

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { CaptureDataDto } from './dtos/capture.dto';
import { PredictNextDto } from './dtos/predict.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * Endpoint for the frontend to submit data about a completed round.
   * This is used for logging and learning.
   */
  @Post('capture')
  @HttpCode(HttpStatus.ACCEPTED) // Use 202 Accepted as we are just logging data.
  async captureRound(@Body() captureDataDto: CaptureDataDto): Promise<{ message: string }> {
    await this.gameService.logCompletedRound(captureDataDto);
    return { message: 'Round data accepted for logging.' };
  }

  /**
   * Endpoint for the frontend to request a prediction for the next round.
   * This will add a job to the queue for background AI processing.
   */
  @Post('predict')
  @HttpCode(HttpStatus.ACCEPTED) // Use 202 Accepted because the work is done in the background.
  async predictNextRound(@Body() predictNextDto: PredictNextDto): Promise<{ message: string; jobId: string | number }> {
    const jobId = await this.gameService.queuePredictionJob(predictNextDto);
    return {
      message: 'Prediction request accepted. Processing in the background.',
      jobId: jobId, // The frontend can optionally use this ID to check the job status later.
    };
  }
}
