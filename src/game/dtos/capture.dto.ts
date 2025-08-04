import { IsNotEmpty, IsObject, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class RoundDataDto {
  @IsString()
  @IsNotEmpty()
  roundId!: string; // FIX: Added !
  @IsString()
  hash!: string; // FIX: Added !
  @IsString()
  @IsNotEmpty()
  result!: string; // FIX: Added !
}
export class CaptureDataDto {
  @IsUrl()
  siteUrl!: string; // FIX: Added !
  @IsObject()
  @ValidateNested()
  @Type(() => RoundDataDto)
  roundData!: RoundDataDto; // FIX: Added !
}