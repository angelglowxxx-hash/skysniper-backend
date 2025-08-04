import { IsArray, IsString, IsUrl, IsOptional } from 'class-validator';
export class PredictNextDto {
  @IsUrl()
  siteUrl!: string; // FIX: Added !
  @IsString()
  @IsOptional()
  hash?: string;
  @IsString()
  @IsOptional()
  roundId?: string;
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  patternHistory?: string[];
}