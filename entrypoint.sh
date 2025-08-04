#!/bin/sh
# entrypoint.sh - Production startup script for SkySniper X

# This script ensures that database migrations are applied before the main application starts.
# It is used by the Dockerfile for production deployments on services like Render.

# Exit immediately if a command exits with a non-zero status. This is a safety measure.
set -e

echo "[entrypoint.sh] SkySniper X container is starting..."

# -----------------------------------------------------------------------------
# Step 1: Apply Database Migrations
# -----------------------------------------------------------------------------
# We use 'prisma migrate deploy' because it's the non-interactive command
# intended for production environments. It applies all pending migrations that
# have been generated during development (with 'prisma migrate dev').
echo "[entrypoint.sh] Applying database migrations..."
npx prisma migrate deploy
echo "[entrypoint.sh] Database migrations applied successfully."


# -----------------------------------------------------------------------------
# Step 2: Start the Application
# -----------------------------------------------------------------------------
# The 'exec' command is important. It replaces the shell process with the
# Node.js process. This ensures that system signals (like a shutdown signal
# from Render) are passed directly to our application, allowing for a
# graceful shutdown.
echo "[entrypoint.sh] Starting the NestJS application..."
exec node dist/main```

---

### Critical Next Step: Make the Script Executable

On most systems (Linux, macOS, and inside the Docker container), a script file needs to have "execute" permissions before it can be run. The best way to handle this is to tell Git to store these permissions.

After you have created and saved the `entrypoint.sh` file, run the following command in your terminal from the project's root directory:

```bash
git update-index --chmod=+x entrypoint.sh
