# Dockerfile (ATUALIZADO)
FROM node:18-alpine as builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend  
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
RUN npm install --only=production

# Copy frontend build
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 3000

CMD ["node", "dist/server.js"]