// src/game/game.controller.ts (Corrected)
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { CaptureDataDto } from './dtos/capture.dto';
import { PredictNextDto } from './dtos/predict.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('capture')
  @HttpCode(HttpStatus.ACCEPTED)
  async captureRound(@Body() captureDataDto: CaptureDataDto): Promise<{ message: string }> {
    await this.gameService.logCompletedRound(captureDataDto);
    return { message: 'Round data accepted for logging.' };
  }

  @Post('predict')
  @HttpCode(HttpStatus.ACCEPTED)
  async predictNextRound(@Body() predictNextDto: PredictNextDto): Promise<{ message: string; jobId: string | number }> {
    const job = await this.gameService.queuePredictionJob(predictNextDto); // FIX: Get the job object
    return {
      message: 'Prediction request accepted. Processing in the background.',
      jobId: job.id, // FIX: Access the id property
    };
  }
}