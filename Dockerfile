# Multi-stage Dockerfile for CoTrain Monorepo
# This Dockerfile can build different applications based on the BUILD_TARGET argument

# Base stage with Node.js and pnpm
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/
COPY libs/*/package.json ./libs/*/

# Dependencies stage
FROM base AS deps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS dev

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/libs ./libs

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 3001 3002

# Default command for development
CMD ["pnpm", "dev"]

# Build stage
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/libs ./libs

# Copy source code
COPY . .

# Build argument to specify which app to build
ARG BUILD_TARGET=frontend

# Build the application
RUN pnpm build --filter=${BUILD_TARGET}

# Production stage for frontend
FROM node:18-alpine AS frontend-prod

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy built frontend application
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/apps/frontend/next.config.js ./apps/frontend/next.config.js

# Copy shared packages
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["pnpm", "--filter=frontend", "start"]

# Production stage for backend
FROM node:18-alpine AS backend-prod

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy built backend application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

# Copy shared packages
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "--filter=backend", "start:prod"]

# Production stage for docs
FROM nginx:alpine AS docs-prod

# Copy built documentation
COPY --from=builder /app/apps/docs/build /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Testing stage
FROM base AS test

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/libs ./libs

# Copy source code
COPY . .

# Run tests
CMD ["pnpm", "test"]

# Linting stage
FROM base AS lint

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/libs ./libs

# Copy source code
COPY . .

# Run linting
CMD ["pnpm", "lint"]

# Security scanning stage
FROM base AS security

# Install security tools
RUN npm install -g audit-ci

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Run security audit
CMD ["audit-ci", "--config", "audit-ci.json"]

# Multi-service stage (for docker-compose)
FROM base AS multi-service

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/libs ./libs

# Copy source code
COPY . .

# Install PM2 for process management
RUN npm install -g pm2

# Copy PM2 configuration
COPY docker/ecosystem.config.js ./

# Expose ports
EXPOSE 3000 3001 3002

# Start all services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

# Default stage (development)
FROM dev AS default