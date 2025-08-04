// src/common/cache/cache.module.ts
// -----------------------------------------------------------------------------
// This module packages the CacheService and makes it globally available
// for dependency injection, providing a high-speed caching layer for the app.
// -----------------------------------------------------------------------------

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global() // 👈 Makes this module's exports available application-wide.
@Module({
  imports: [
    ConfigModule, // Needed because CacheService injects ConfigService.
  ],
  providers: [CacheService],
  exports: [CacheService], // Export so other services can inject CacheService.
})
export class CacheModule {}
