# Multi-stage Dockerfile for TikTok Story AI
# Supports development and production builds

# =============================================================================
# Base Stage - Common dependencies
# =============================================================================
FROM node:20-alpine AS base

# Install essential tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# =============================================================================
# Dependencies Stage - Install packages
# =============================================================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# =============================================================================
# Development Stage - Hot reload enabled
# =============================================================================
FROM base AS development

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Environment variables for development
ENV NODE_ENV=development
ENV VITE_HOST=0.0.0.0

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# Builder Stage - Build production assets
# =============================================================================
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV=production

# Build the application
RUN npm run build

# =============================================================================
# Production Stage - Optimized for deployment
# =============================================================================
FROM nginx:alpine AS production

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
