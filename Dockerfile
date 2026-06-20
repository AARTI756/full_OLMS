# Use a lightweight Node image for production builds
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first to leverage caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files and build the app
COPY . .
RUN npm run build

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/next.config.ts ./next.config.ts
COPY --from=base /app/src ./src

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
