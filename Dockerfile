# Dockerfile (DEFINITIVE, FINAL VERSION FOR PRISMA BUILD PROCESS)

# --------------------------------------------------------------------
# Stage 1: Builder
# --------------------------------------------------------------------
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package definitions and generate Prisma Client FIRST
COPY package*.json ./
COPY prisma ./prisma
# DEFINITIVE FIX: Run `prisma generate` BEFORE `npm install`.
# This generates the client based on the schema file alone, without needing a database connection.
RUN npx prisma generate
RUN npm install

# Now copy the rest of the code and build the application
COPY . .
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# --------------------------------------------------------------------
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copy all necessary built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Also copy the generated client from the builder stage
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN chown -R node:node /app
USER node

EXPOSE 8080
CMD ["./entrypoint.sh"]
