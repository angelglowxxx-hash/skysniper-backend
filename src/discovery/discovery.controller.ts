// src/discovery/discovery.controller.ts
// -----------------------------------------------------------------------------
// This controller exposes the API endpoint for the site discovery feature.
// It receives raw data from a new website and initiates the analysis process.
// -----------------------------------------------------------------------------

import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

// We will create this DTO (Data Transfer Object) in the next step.
// For now, let's assume it exists to define the expected request body.
// import { DiscoverSiteDto } from './dto/discover-site.dto';

// Let's define the DTO inline for now to keep it simple.
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
export class DiscoverSiteDto {
  @IsUrl()
  siteUrl: string;

  @IsString()
  @IsNotEmpty()
  rawDom: string; // This will be a stringified snapshot of the page's DOM
}

@Controller('discover')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true })) // Ensure our DTO is validated
  async discoverSite(@Body() discoverSiteDto: DiscoverSiteDto): Promise<{ message: string }> {
    // The controller's job is simple: delegate the complex logic to the service.
    await this.discoveryService.initiateDiscovery(discoverSiteDto.siteUrl, discoverSiteDto.rawDom);

    // Return an immediate response to the client.
    // The actual AI analysis will happen in the background via our job queue.
    return {
      message: 'Site discovery initiated. Analysis is processing in the background.',
    };
  }
}
