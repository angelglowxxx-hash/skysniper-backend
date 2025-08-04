// src/common/database/prisma.service.ts
// -----------------------------------------------------------------------------
// This service acts as a wrapper around the Prisma Client. It handles the
// database connection lifecycle and makes the client injectable throughout the app.
// It's the single point of entry for all database interactions.
// -----------------------------------------------------------------------------

import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Pass logging options to the Prisma Client constructor.
    // This will log database queries to the console during development,
    // but only warnings and errors in production for cleaner logs.
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  // This lifecycle hook is called automatically by NestJS when the module is initialized.
  // We explicitly connect to the database here to ensure a connection is
  // established right at the start of the application.
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('⚪️ Prisma Service: Successfully connected to the database.');
    } catch (error) {
      console.error('🔴 Prisma Service: Failed to connect to the database.', error);
      // In a real production scenario, you might want to exit the process
      // if the database connection fails on startup.
      // process.exit(1);
    }
  }

  // This is a crucial cleanup hook for graceful shutdowns. It ensures that
  // the database connection is closed properly when the app terminates.
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      // This is not a standard NestJS lifecycle hook, so we listen to the process event
      // to ensure cleanup happens before the Node.js process exits.
      await app.close(); // This will trigger onModuleDestroy in all modules
    });
  }

  // This standard NestJS hook is called when the application is shutting down.
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('⚪️ Prisma Service: Successfully disconnected from the database.');
  }
}
