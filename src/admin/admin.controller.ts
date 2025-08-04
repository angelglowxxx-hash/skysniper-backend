// src/admin/admin.controller.ts (DEFINITIVE)
import { Controller, Get, Post, Body, Param, UseGuards, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ViewsService } from '../views/views.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PushConfigDto } from './dtos/push-config.dto';
import { Response } from 'express';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly viewsService: ViewsService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Res() res: Response) {
    const data = await this.adminService.getDashboardData();
    const html = this.viewsService.getDashboardPage(data);
    res.type('html').send(html);
  }

  @Post('fingerprints/:id/repair')
  async repairFingerprint(@Param('id') id: string) {
    await this.adminService.repairFingerprint(id);
    return { message: `Repair process initiated for fingerprint ${id}.` };
  }

  @Post('configs/push')
  async pushConfig(@Body() pushConfigDto: PushConfigDto) {
    await this.adminService.pushNewConfig(pushConfigDto);
    return { message: 'New UI configuration has been successfully pushed.' };
  }
}