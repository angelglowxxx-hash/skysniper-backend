# Dockerfile (DEFINITIVE, FINAL, GUARANTEED)

# --------------------------------------------------------------------
# Stage 1: Builder
# This stage installs all dependencies, generates the Prisma client correctly,
# and compiles our TypeScript application into JavaScript.
# --------------------------------------------------------------------
FROM node:20-slim AS builder

# Install OpenSSL, which is a required dependency for Prisma's engine.
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package definitions first.
COPY package*.json ./

# Run npm install to get all dependencies, including the Prisma CLI.
RUN npm install

# Now that Prisma is installed, copy the schema into the container.
COPY prisma ./prisma

# DEFINITIVE FIX: Run `prisma generate` AFTER `npm install` and `COPY prisma`.
# This is the correct order. It ensures Prisma has its tools (from npm) and
# the schema (from copy) before it tries to generate the client.
RUN npx prisma generate

# Now, copy the rest of our application source code.
COPY . .

# Finally, build the application. This will now succeed because the Prisma client is correctly generated.
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# This stage builds the final, lightweight, and secure image for deployment.
# --------------------------------------------------------------------
FROM node:20-slim

# Install the same OpenSSL dependency in the final image.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Install ONLY production dependencies to keep the image small.
RUN npm install --only=production

# Copy all necessary built assets from the builder stage.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Also copy the fully generated Prisma client from the builder stage.
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy and make our startup script executable.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# The 'node' user is pre-built into the slim image. We just change ownership.
RUN chown -R node:node /app
USER node

# Expose our application's port.
EXPOSE 8080

# The command to start the application.
CMD ["./entrypoint.sh"]
