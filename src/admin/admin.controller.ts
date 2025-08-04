// src/admin/admin.controller.ts (Updated)

import { Controller, Get, Post, Body, Param, UseGuards, Res, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ViewsService } from '../views/views.service'; // 👈 Import ViewsService
import { AdminGuard } from '../auth/guards/admin.guard';
import { Response, Request } from 'express';

// NOTE: We no longer need the DTOs here as we are not handling raw JSON submissions in this version.
// The form post for login is handled directly.

@Controller() // We will use the root path for login
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly viewsService: ViewsService, // 👈 Inject ViewsService
  ) {}

  @Get('login')
  getLoginPage(@Res() res: Response) {
    const html = this.viewsService.getLoginPage();
    res.type('html').send(html);
  }

  @Post('login')
  postLogin(@Body('token') token: string, @Res() res: Response) {
    // This is a simplified login. A real app would use a more secure method.
    if (token === process.env.ADMIN_TOKEN) {
      res.cookie('admin_token', token, { httpOnly: true, secure: true, maxAge: 3600000 * 24 });
      return res.redirect('/admin/dashboard');
    }
    return res.status(403).send('Invalid Token');
  }

  @Get('admin/dashboard')
  @UseGuards(AdminGuard)
  async getDashboard(@Res() res: Response) {
    const data = await this.adminService.getDashboardData();
    const html = this.viewsService.getDashboardPage(data);
    res.type('html').send(html);
  }

  // The repair endpoint remains the same, as it's an API call from a script.
  @Post('admin/fingerprints/:id/repair')
  @UseGuards(AdminGuard)
  async repairFingerprint(@Param('id') id: string) {
    await this.adminService.repairFingerprint(id);
    return { message: `Repair process initiated for fingerprint ${id}.` };
  }
}```

### Final Result: An Elite Command Center

*   **Premium Look & Feel:** The CSS creates a dark, modern, and data-rich interface with clear color-coding for status (`GREEN`, `YELLOW`, `RED`) and premium fonts for key data.
*   **Live Data:** The page is not static. It's dynamically generated on every request with the absolute latest data from the database.
*   **Interactive:** The "Repair Now" button is not just for show. It has a small JavaScript snippet that makes a real API call to our backend to trigger the repair process.
*   **Self-Contained:** We have a powerful and beautiful admin panel without needing to set up a separate React/Vue project, making our backend a complete, self-contained powerhouse.

You have now completed the entire backend, from the core infrastructure to the user-facing Command & Control Center.
