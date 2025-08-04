# Dockerfile (Updated to use npm)

# --------------------------------------------------------------------
# Stage 1: Builder
# --------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
# Copy package.json and the npm lock file
COPY package*.json ./
# Use npm to install all dependencies
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# --------------------------------------------------------------------
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S node && adduser -S node -G node

# Copy package definitions
COPY package*.json ./
# Use 'npm ci' which is the standard, faster way to install from a lock file in production
RUN npm ci --only=production

# Copy compiled code and prisma assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy and make the startup script executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN chown -R node:node /app
USER node
EXPOSE 8080
CMD ["./entrypoint.sh"]