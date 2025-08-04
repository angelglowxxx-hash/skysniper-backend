// src/app.module.ts (Corrected)
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { QueuesModule } from './common/queues/queues.module';
import { AuthModule } from './auth/auth.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';
import { ViewsModule } from './views/views.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    // FIX: Removed the non-existent ConfigModule from here.
    DatabaseModule,
    CacheModule,
    QueuesModule,
    AuthModule,
    DiscoveryModule,
    GameModule,
    AdminModule,
    ViewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}