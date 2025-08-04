// src/discovery/discovery.module.ts
// -----------------------------------------------------------------------------
// This module bundles all components related to the site discovery feature.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

// Note: We don't need to import DatabaseModule, CacheModule, or QueuesModule
// because they are marked as @Global. Their services are automatically available.

@Module({
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
