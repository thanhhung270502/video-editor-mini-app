# Stage 1: Build TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

# Install ffmpeg (codec support) and yt-dlp via pip
RUN apk add --no-cache ffmpeg python3 py3-pip \
  && pip3 install --no-cache-dir yt-dlp --break-system-packages

WORKDIR /app

# Copy compiled output and production deps only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create temp directory for intermediate video files
RUN mkdir -p /app/temp

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
