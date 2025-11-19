FROM node:18-alpine as builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Build backend  
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy apenas o necessário do backend (SEM node_modules)
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/src ./backend/src

# Copy frontend
COPY --from=builder /app/frontend ./frontend

# Instalar APENAS produção no container final
WORKDIR /app/backend
RUN npm ci --only=production

WORKDIR /app

EXPOSE 3000

CMD ["node", "backend/src/app.js"]