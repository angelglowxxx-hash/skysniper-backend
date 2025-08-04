// src/admin/admin.controller.ts
// -----------------------------------------------------------------------------
// The secure API gateway for the Admin Command & Control Center.
// All routes in this controller are protected by the AdminGuard.
// -----------------------------------------------------------------------------

import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PushConfigDto } from './dtos/push-config.dto';

@UseGuards(AdminGuard) // 👈 This single line protects the ENTIRE controller. Elite.
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * The main endpoint to fetch all data needed to render the dashboard.
   */
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardData();
  }

  /**
   * Endpoint to trigger the "repair" function for a fingerprint.
   */
  @Post('fingerprints/:id/repair')
  @HttpCode(HttpStatus.OK)
  async repairFingerprint(@Param('id') id: string) {
    await this.adminService.repairFingerprint(id);
    return { message: `Repair process initiated for fingerprint ${id}.` };
  }

  /**
   * Endpoint to push a new, manually created UI config.
   */
  @Post('configs/push')
  @HttpCode(HttpStatus.CREATED)
  async pushConfig(@Body() pushConfigDto: PushConfigDto) {
    await this.adminService.pushNewConfig(pushConfigDto);
    return { message: 'New UI configuration has been successfully pushed.' };
  }
}
