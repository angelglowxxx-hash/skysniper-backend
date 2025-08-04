# Dockerfile (Optimized for Render Deployment)

# --------------------------------------------------------------------
# Stage 1: Builder
# (This stage remains the same - it's already optimized)
# --------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Using 'pnpm' as per your lockfile choice
RUN npm install -g pnpm && pnpm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# Final, lightweight production image.
# --------------------------------------------------------------------
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S node && adduser -S node -G node

# Copy only production dependencies definitions
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Copy compiled code and prisma schema from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create and execute a startup script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN chown -R node:node /app
USER node

EXPOSE 8080

# Use the entrypoint script to start the application
CMD ["./entrypoint.sh"]
