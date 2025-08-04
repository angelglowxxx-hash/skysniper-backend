# Dockerfile (Final Version - Updated)

# --------------------------------------------------------------------
# Stage 1: Builder
# This stage installs all dependencies and compiles the application.
# --------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Use 'npm install' to get all dependencies needed for the build (including devDependencies).
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# This stage creates the final, lightweight, and secure image.
# --------------------------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# Copy package definitions.
COPY package*.json ./

# CRITICAL FIX: Use 'npm install' instead of 'npm ci'.
# 'npm install' is more lenient if the lock file is missing but will use it if present.
# '--only=production' ensures we only install production dependencies, keeping the image small.
RUN npm install --only=production

# Copy the compiled application code from the 'builder' stage.
COPY --from=builder /app/dist ./dist

# Copy the Prisma schema and the generated client for runtime.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy and make the startup script executable.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Change ownership of all application files to the non-root 'node' user.
RUN chown -R node:node /app

# Switch to the non-root 'node' user for enhanced security.
USER node

# Expose the port the application will run on.
EXPOSE 8080

# The command to run when the container starts.
CMD ["./entrypoint.sh"]