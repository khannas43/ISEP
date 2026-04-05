# ISEP Frontend — Next.js 14 (standalone) for single-bundle deployment
# Build: docker build -t isep-frontend ./frontend
# Run: expects NEXTAUTH_URL, NEXTAUTH_SECRET, KEYCLOAK_* at runtime (see docker-compose.prod.yml)

FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args for NEXT_PUBLIC_* (baked into client bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000
ARG NEXT_PUBLIC_KEYCLOAK_ISSUER=http://localhost:8180/realms/isep-realm
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_NEXTAUTH_URL=$NEXT_PUBLIC_NEXTAUTH_URL
ENV NEXT_PUBLIC_KEYCLOAK_ISSUER=$NEXT_PUBLIC_KEYCLOAK_ISSUER

COPY package.json package-lock.json* ./
RUN npm ci --omit=optional
COPY . .
# Ensure public exists (Next.js static assets); empty if project has none
RUN mkdir -p public
RUN npm run build

# Production runner — standalone output (node:20-alpine already has group/user "node")
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nextjs && adduser -S nextjs -u 1001 -G nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
