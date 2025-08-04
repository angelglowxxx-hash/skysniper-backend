// src/admin/admin.module.ts
// -----------------------------------------------------------------------------
// Bundles all components for the Admin Command & Control Center.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module'; // We need to import AuthModule to use the AdminGuard.

@Module({
  imports: [AuthModule], // Import AuthModule to make AdminGuard available.
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
