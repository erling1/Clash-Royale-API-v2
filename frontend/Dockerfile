# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install deps against the lockfile first so this layer caches.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# NEXT_PUBLIC_API_URL is empty by default -> browser uses same-origin /api/*.
RUN npm run build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Bring the built app + node_modules over. (Simple; swap to Next.js
# `output: "standalone"` later for a much smaller image.)
COPY --from=build /app ./

EXPOSE 3001
# package.json: "start": "next start -p 3001"
CMD ["npm", "run", "start"]
