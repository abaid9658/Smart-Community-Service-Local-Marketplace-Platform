FROM node:20-alpine
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install all deps (including devDeps needed for build)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript -> dist/
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
