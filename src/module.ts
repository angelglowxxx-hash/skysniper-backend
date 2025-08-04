// src/app.module.ts
// -----------------------------------------------------------------------------
// This is the root module of the SkySniper X application.
// It acts as the central hub, importing and assembling all other modules.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

// --- Import our custom application modules ---

// Common, foundational modules that provide services to the rest of the app.
import { ConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { QueuesModule } from './common/queues/queues.module';

// Feature modules that contain our application's business logic.
import { AuthModule } from './auth/auth.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';
import { ViewsModule } from './views/views.module';

@Module({
  imports: [
    // -----------------------------------------------------------------
    // Core NestJS Configuration Module
    // -----------------------------------------------------------------
    // This MUST be imported first. It loads environment variables from the .env file
    // and makes them available application-wide via the ConfigService.
    NestConfigModule.forRoot({
      isGlobal: true, // No need to import ConfigModule in other modules.
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Optional: for different env files like .env.production
      // We can add validation here later if needed.
    }),

    // -----------------------------------------------------------------
    // Common Foundational Modules
    // -----------------------------------------------------------------
    // These modules provide essential services (DB, Cache, Queues)
    // that will be used by our feature modules.
    ConfigModule,     // Our custom wrapper for env variables (if we add more complex logic)
    DatabaseModule,   // Provides the PrismaService for database access.
    CacheModule,      // Provides the Redis client for caching.
    QueuesModule,     // Provides BullMQ for background job processing.

    // -----------------------------------------------------------------
    // Application Feature Modules
    // -----------------------------------------------------------------
    // These modules contain the specific controllers, services, and logic
    // for each part of our application.
    AuthModule,       // Handles admin login and security guards.
    DiscoveryModule,  // Handles auto-detection of new game sites.
    GameModule,       // Handles core game interaction (capture, predict).
    AdminModule,      // Handles the command-and-control admin panel.
    ViewsModule,      // Renders server-side HTML for the admin login page.
  ],

  // No controllers or providers are declared here directly.
  // The root module's job is purely to assemble the other modules.
  controllers: [],
  providers: [],
})
export class AppModule {}
