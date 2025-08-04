// src/auth/auth.module.ts
// -----------------------------------------------------------------------------
// This module provides authentication and authorization-related components,
// primarily the AdminGuard for protecting sensitive endpoints.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    ConfigModule, // We need ConfigModule to allow the AdminGuard to inject ConfigService.
  ],
  providers: [
    AdminGuard, // The guard is a provider.
  ],
  exports: [
    AdminGuard, // We export the guard so that other modules (like AdminModule) can use it.
  ],
})
export class AuthModule {}
