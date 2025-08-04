# Dockerfile (DEFINITIVE, FINAL VERSION FOR PRISMA COMPATIBILITY)

# --------------------------------------------------------------------
# Stage 1: Builder
# Use the 'slim' variant of the Node image. It is based on Debian, which
# has much better library compatibility than Alpine Linux for binaries like Prisma's engine.
# --------------------------------------------------------------------
FROM node:20-slim AS builder

# DEFINITIVE FIX: Install the specific OpenSSL library that Prisma requires to run reliably.
RUN apt-get update && apt-get install -y openssl

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# Use the same 'slim' base for the final image.
# --------------------------------------------------------------------
FROM node:20-slim

# DEFINITIVE FIX: Install the same OpenSSL library in the final production image.
# Clean up the apt cache afterwards to keep the image size small.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# This next line is critical for Prisma to find its engine at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# The 'node' user is pre-built into the slim image.
# We just need to change ownership of our app files.
RUN chown -R node:node /app
USER node

EXPOSE 8080
CMD ["./entrypoint.sh"]