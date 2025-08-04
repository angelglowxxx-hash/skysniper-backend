// src/discovery/discovery.controller.ts (Corrected)
import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DiscoverSiteDto {
  @IsUrl()
  siteUrl!: string; // FIX: Added !
  @IsString()
  @IsNotEmpty()
  rawDom!: string; // FIX: Added !
}

@Controller('discover')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async discoverSite(@Body() discoverSiteDto: DiscoverSiteDto): Promise<{ message: string }> {
    await this.discoveryService.initiateDiscovery(discoverSiteDto.siteUrl, discoverSiteDto.rawDom);
    return {
      message: 'Site discovery initiated. Analysis is processing in the background.',
    };
  }
}