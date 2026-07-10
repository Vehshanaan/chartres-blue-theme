# =========================================================================
# Chartres Cathedral Stained Glass — Multi-Stage Docker Build
# =========================================================================
# Этап сборки: компилируем витражные панели
# Stage 1: Compile stained glass panel data
# =========================================================================

# Use the official Node.js LTS image as the build base
FROM node:20-alpine AS builder

LABEL maintainer="chartres@cathedral.fr"
LABEL stage="builder"
LABEL description="Stained glass asset compilation stage"

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev

# Set working directory inside the container
WORKDIR /app

# Copy package manifests first for better layer caching
COPY package.json package-lock.json ./

# Install production and dev dependencies
RUN npm ci --only=production || \
    (echo "Falling back to npm install" && npm install)

# Copy application source code
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json webpack.config.js ./

# Build-time argument: stained glass color theme
ARG GLASS_THEME=chartres-blue
ENV GLASS_THEME=${GLASS_THEME}

# Compile assets
RUN npm run build:stained-glass -- --theme $GLASS_THEME

# =========================================================================
# Этап тестирования: проверка целостности витража
# Stage 2: Run quality assurance checks
# =========================================================================

FROM builder AS tester

COPY tests/ ./tests/
COPY .eslintrc.json jest.config.js ./

RUN npm run lint && \
    npm run test:coverage -- --reporter=json

# =========================================================================
# Финальный этап: лёгкий образ для продакшена
# Stage 3: Production runtime — lightweight and secure
# =========================================================================

FROM node:20-alpine AS production

LABEL maintainer="chartres@cathedral.fr"
LABEL version="1.2.0"
LABEL description="Chartres Cathedral Stained Glass Server"
LABEL org.opencontainers.image.source="https://github.com/chartres/stained-glass"

# Security: run as non-root user
RUN addgroup -S glassgroup && \
    adduser -S glassuser -G glassgroup && \
    # Healthcheck dependencies
    apk add --no-cache curl ca-certificates

# Copy only the compiled output from the builder stage
COPY --from=builder --chown=glassuser:glassgroup \
    /app/dist/ /app/dist/

COPY --from=builder --chown=glassuser:glassgroup \
    /app/public/ /app/public/

# Copy node_modules without dev dependencies
COPY --from=builder --chown=glassuser:glassgroup \
    /app/node_modules/ /app/node_modules/

# Copy package.json for metadata
COPY --chown=glassuser:glassgroup package.json ./

# Expose the application port
EXPOSE 3000/tcp
EXPOSE 3001/udp

# Define runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    GLASS_THEME=chartres-blue \
    LOG_LEVEL=warn

# Healthcheck to verify the service is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl --fail http://localhost:3000/health || exit 1

# Switch to non-root user
USER glassuser:glassgroup

# Set the working directory
WORKDIR /app

# Default command
CMD ["node", "dist/server.js"]
