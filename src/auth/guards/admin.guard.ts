// src/auth/guards/admin.guard.ts (DEFINITIVE)
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
    // FIX: Check if the token exists. If not, throw a hard error.
    const token = this.configService.get<string>('ADMIN_TOKEN');
    if (!token) {
      throw new Error('FATAL_ERROR: ADMIN_TOKEN is not defined in environment variables.');
    }
    this.adminToken = token;
  }

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const headerToken = request.headers['x-admin-token'] as string;
    const cookieToken = request.cookies?.admin_token;
    const providedToken = headerToken || cookieToken;

    if (!providedToken) {
      throw new UnauthorizedException('Admin token is missing.');
    }

    if (providedToken !== this.adminToken) {
      throw new ForbiddenException('Invalid admin token.');
    }

    return true;
  }
}