// src/main.ts
// -----------------------------------------------------------------------------
// This is the main entry point for the SkySniper X application.
// It initializes the NestJS app, configures global middleware, and starts the server.
// It also integrates graceful shutdown hooks for database connections.
// -----------------------------------------------------------------------------

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './common/database/prisma.service'; // 👈 IMPORT PRISMA SERVICE

async function bootstrap() {
  // Create the NestJS application instance, using our root AppModule.
  const app = await NestFactory.create(AppModule);

  // Get an instance of the ConfigService from the app's DI container.
  // This allows us to safely access our environment variables.
  const configService = app.get(ConfigService);

  // --- GLOBAL MIDDLEWARE CONFIGURATION ---

  // 1. Enable CORS (Cross-Origin Resource Sharing)
  // This is essential for allowing our browser extension frontend to communicate
  // with this backend server.
  app.enableCors({
    origin: '*', // For development. In production, you might restrict this to your extension's ID or specific domains.
    credentials: true, // Allows cookies to be sent from the frontend (needed for admin auth).
  });

  // 2. Enable Cookie Parser
  // This middleware parses cookies from incoming requests, making them available on `req.cookies`.
  app.use(cookieParser());

  // --- GLOBAL PIPES CONFIGURATION ---

  // 1. Enable Global Validation Pipe
  // This automatically validates all incoming request bodies against their DTOs (Data Transfer Objects).
  // This is a cornerstone of our "elite" setup, ensuring data integrity.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip properties that do not have any decorators in the DTO.
      transform: true, // Automatically transform incoming data to the DTO's specified types.
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided.
      transformOptions: {
        enableImplicitConversion: true, // Allows for automatic type conversion (e.g., string '25' to number 25).
      },
    }),
  );

  // --- ENABLE GRACEFUL SHUTDOWN HOOKS ---
  // This is a critical step for production-readiness. It ensures that when the
  // application receives a shutdown signal, it will cleanly disconnect from the database.
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app); // 👈 ACTIVATE THE HOOK

  // --- START THE SERVER ---

  // Get the port from our environment variables, with a fallback to 8080.
  const port = configService.get<number>('PORT', 8080);

  // Start listening for incoming requests on the configured port.
  await app.listen(port);

  // Log a confirmation message to the console once the server is running.
  console.log(
    `✅ SkySniper X Elite Backend is online and listening on http://localhost:${port}`,
  );
}

// Execute the bootstrap function to start the application.
bootstrap();
