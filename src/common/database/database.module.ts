// src/common/database/database.module.ts
// -----------------------------------------------------------------------------
// This module packages the PrismaService and makes it globally available
// for dependency injection. This is a core foundational module.
// -----------------------------------------------------------------------------

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 This powerful decorator makes the module's exports available everywhere.
@Module({
  providers: [
    // We register PrismaService as a provider within the NestJS ecosystem.
    PrismaService,
  ],
  exports: [
    // We export PrismaService, making it available to any other module
    // that imports this DatabaseModule (which is only our AppModule, thanks to @Global).
    PrismaService,
  ],
})
export class DatabaseModule {}
