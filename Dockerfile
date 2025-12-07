FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install openssl for Prisma/Drizzle if needed
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs --home /home/nextjs nextjs
RUN mkdir -p /home/nextjs && chown nextjs:nodejs /home/nextjs

ENV HOME=/home/nextjs
ENV NODE_PATH=/app/node_modules

# Copy all source files for runtime build
COPY --from=builder --chown=nextjs:nodejs /app ./

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Install dependencies needed for seeding/migration AND build
RUN NODE_ENV=development npm install --no-save drizzle-kit tsx dotenv
ENV NODE_ENV production

# Fix permissions for nextjs user
RUN chown -R nextjs:nodejs /home/nextjs

# Copy entrypoint
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]