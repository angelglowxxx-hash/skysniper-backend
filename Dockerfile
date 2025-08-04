# Dockerfile (Final Version)

# --------------------------------------------------------------------
# Stage 1: Builder
# --------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# --------------------------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# The 'node' user already exists in the base image, so we don't need to create it.
# The following line has been REMOVED:
# RUN addgroup -S node && adduser -S node -G node

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# We still need to change ownership of the files to the existing 'node' user.
RUN chown -R node:node /app

# We still switch to the non-root 'node' user for security.
USER node

EXPOSE 8080
CMD ["./entrypoint.sh"]