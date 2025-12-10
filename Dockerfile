############## Dependencies ##############
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

############## Build ##############
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ENV CI=false
RUN yarn build

############## Runtime (Lambda container) ##############
FROM node:20-alpine AS runner
WORKDIR /app

# Add AWS Lambda Web Adapter (as an extension)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter

ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Lambda will route traffic via the adapter to this port
EXPOSE 3000

USER nextjs
CMD ["node", "server.js"]
