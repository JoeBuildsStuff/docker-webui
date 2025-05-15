# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a system group 'nodejs' with a fixed GID
RUN addgroup --system --gid 1001 nodejs
# Create the nextjs user, belonging to nodejs and the existing 'dialout' group (GID 20)
RUN adduser --system --uid 1001 --ingroup nodejs --ingroup dialout nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# TODO: Temporarily comment out to run as root - I keep getting errors about permissions 
# even though the LLM says this should be correct
# USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"] 