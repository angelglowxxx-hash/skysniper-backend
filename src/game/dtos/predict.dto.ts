// src/game/dtos/predict.dto.ts
// -----------------------------------------------------------------------------
// Defines the data structure for requesting a prediction for a new round.
// -----------------------------------------------------------------------------

import { IsArray, IsString, IsUrl, IsOptional } from 'class-validator';

export class PredictNextDto {
  @IsUrl()
  siteUrl: string;

  @IsString()
  @IsOptional() // The hash might not be available yet when we ask for a prediction.
  hash?: string;
  
  @IsString()
  @IsOptional()
  roundId?: string;

  @IsArray()
  @IsString({ each: true }) // Ensures each item in the array is a string.
  @IsOptional()
  // A history of previous results (e.g., ["1.23x", "5.01x", "1.00x"])
  patternHistory?: string[];
}
