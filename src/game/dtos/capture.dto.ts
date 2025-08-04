// src/game/dtos/capture.dto.ts
// -----------------------------------------------------------------------------
// Defines the data structure for capturing a completed game round.
// -----------------------------------------------------------------------------

import { IsNotEmpty, IsObject, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Nested object for the round details
class RoundDataDto {
  @IsString()
  @IsNotEmpty()
  roundId: string;

  @IsString()
  hash: string;
  
  @IsString()
  @IsNotEmpty()
  result: string; // e.g., "2.15x"
}

export class CaptureDataDto {
  @IsUrl()
  siteUrl: string;

  @IsObject()
  @ValidateNested() // This tells the validator to also validate the nested object.
  @Type(() => RoundDataDto) // This tells class-transformer which class to use for the nested object.
  roundData: RoundDataDto;
}
