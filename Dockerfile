# Dockerfile

# --------------------------------------------------------------------
# Stage 1: Builder
# This stage installs all dependencies (including dev), generates the
# Prisma client, and compiles the TypeScript code into JavaScript.
# --------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock files first to leverage Docker's build cache.
# This layer is only rebuilt if the dependencies change.
COPY package*.json ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate the Prisma Client based on the schema
# This is a critical step before building
RUN npx prisma generate

# Build the NestJS application (compiles TS to JS)
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production
# This stage builds the final, lightweight production image. It only
# contains the compiled code and production dependencies.
# --------------------------------------------------------------------
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Create a non-root user and group for better security
RUN addgroup -S node && adduser -S node -G node

# Copy package.json and lock files again
COPY package*.json ./

# Install ONLY production dependencies.
# 'npm ci' is often faster and safer for CI/CD environments.
RUN npm ci --omit=dev

# Copy the compiled application code from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Copy the Prisma schema. The runtime needs this to find migration files.
COPY --from=builder /app/prisma ./prisma

# Change ownership of the app files to the non-root user
RUN chown -R node:node /app

# Switch to the non-root user for security
USER node

# Expose the port the application will run on.
# This should match the PORT variable in your .env file.
EXPOSE 8080

# The command to start the application when the container launches
CMD ["node", "dist/main"]
