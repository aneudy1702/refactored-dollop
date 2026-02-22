# ---- Base: Node + Chrome system libraries ----
FROM node:20-bookworm-slim AS base

# Install system dependencies required by Puppeteer / Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# ---- Dependencies & Chrome download ----
FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Store Puppeteer's browser cache in a known path so it can be copied to the
# final stage (Puppeteer v20+ stores Chrome in PUPPETEER_CACHE_DIR).
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Install all dependencies; Puppeteer will download Chrome into the cache dir.
RUN npm ci

# ---- Builder ----
FROM deps AS builder

WORKDIR /app

COPY . .

RUN npm run build

# ---- Runner ----
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built Next.js standalone output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Puppeteer is listed in serverExternalPackages, so Next.js does not bundle it.
# Copying the full node_modules ensures the Puppeteer package is available at
# runtime alongside the Chrome binary.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy the downloaded Chrome browser from the deps stage
COPY --from=deps --chown=nextjs:nodejs /app/.cache/puppeteer /app/.cache/puppeteer

# Tell Puppeteer where the cached browser lives
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Chrome requires --no-sandbox inside Docker (set this in puppeteer.launch args)
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
