FROM node:20-alpine AS builder
WORKDIR /app
# Désactive le téléchargement de Chromium par Puppeteer (on installe depuis le pkg système)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci --workspace=apps/backend --workspace=packages/shared
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

FROM node:20-alpine
# Chromium + dépendances système pour Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend
RUN mkdir -p apps/backend/uploads && chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
CMD ["node", "apps/backend/src/server.js"]
