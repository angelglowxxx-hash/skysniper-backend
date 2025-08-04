import { IsJSON, IsNotEmpty, IsString, IsUrl } from 'class-validator';
export class PushConfigDto {
  @IsUrl()
  siteUrl!: string; // FIX: Added !
  @IsString()
  @IsNotEmpty()
  game!: string; // FIX: Added !
  @IsJSON()
  configJson!: string; // FIX: Added !
}