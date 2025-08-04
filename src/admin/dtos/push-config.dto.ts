// src/admin/dtos/push-config.dto.ts
// -----------------------------------------------------------------------------
// Defines and validates the data structure for pushing a new UI config from the admin panel.
// -----------------------------------------------------------------------------

import { IsJSON, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class PushConfigDto {
  @IsUrl()
  siteUrl: string;

  @IsString()
  @IsNotEmpty()
  game: string;

  // The config itself will be a stringified JSON object from a <textarea> in the admin panel.
  @IsJSON()
  configJson: string;
}
