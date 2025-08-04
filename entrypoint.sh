#!/bin/sh
# entrypoint.sh - Production startup script for SkySniper X (DEFINITIVE)

# Exit immediately if a command exits with a non-zero status.
set -e

echo "[entrypoint.sh] SkySniper X container is starting..."

echo "[entrypoint.sh] Applying database migrations..."
# Run Prisma database migrations to ensure the DB is up to date.
npx prisma migrate deploy

echo "[entrypoint.sh] Database migrations applied successfully."

echo "[entrypoint.sh] Starting the NestJS application..."
# The 'exec' command replaces the shell process with the Node.js process.
# This is a best practice for Docker containers.
exec node dist/main
