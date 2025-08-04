// src/auth/guards/admin.guard.ts
// -----------------------------------------------------------------------------
// This Guard protects routes that require admin-level access.
// It checks for a valid admin token in both request headers and cookies.
// -----------------------------------------------------------------------------

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminToken: string;

  constructor(private readonly configService: ConfigService) {
    // We retrieve and store the admin token from environment variables once upon initialization.
    this.adminToken = this.configService.get<string>('ADMIN_TOKEN');
    if (!this.adminToken) {
      // This is a server configuration error, so we throw an error during startup.
      throw new Error('FATAL_ERROR: ADMIN_TOKEN is not defined in environment variables.');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    // Strategy 1: Check for 'x-admin-token' header (for API/script access).
    const headerToken = request.headers['x-admin-token'] as string;

    // Strategy 2: Check for 'admin_token' cookie (for browser/admin panel access).
    const cookieToken = request.cookies?.admin_token;

    // Determine which token to use (header takes precedence).
    const providedToken = headerToken || cookieToken;

    // If no token is provided at all, the request is unauthorized.
    if (!providedToken) {
      throw new UnauthorizedException('Admin token is missing.');
    }

    // Compare the provided token with the environment token.
    if (providedToken !== this.adminToken) {
      // If the token is incorrect, the request is forbidden.
      throw new ForbiddenException('Invalid admin token.');
    }

    // If the token is valid, allow the request to proceed.
    return true;
  }
}
