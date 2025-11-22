# Dockerfile
# Multi-stage build that compiles frontend and backend in a builder stage
# and produces a slim production image with only runtime dependencies.

# ---------- builder stage ----------
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
# Copy package files and install dependencies for a reproducible build
COPY frontend/package*.json ./
RUN npm ci
# Copy frontend source and run production build (produces build/ or dist/)
COPY frontend/ .
RUN npm run build

# Build backend
WORKDIR /app/backend
# Copy backend package files and install dependencies for build step
COPY backend/package*.json ./
RUN npm ci
# Copy backend source and run backend build (if your backend transpiles to dist/)
COPY backend/ .
RUN npm run build

# ---------- production stage ----------
FROM node:18-alpine

WORKDIR /app

# Copy backend package files (package.json and possibly package-lock.json)
# so we can install only production dependencies in the final image.
COPY --from=builder /app/backend/package*.json ./backend/

# Copy backend source and possible build artifacts.
# We copy src in case the app runs directly from source,
# and also copy common build output directories (dist/build) if present.
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/build ./backend/build

# Copy frontend build artifacts (common names: build or dist) so a static server
# or reverse proxy inside the container can serve the frontend.
COPY --from=builder /app/frontend/build ./frontend/build
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install only production dependencies for the backend
WORKDIR /app/backend
# If package-lock.json exists, use `npm ci` for a deterministic install,
# otherwise fallback to `npm install --only=production`.
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

WORKDIR /app

# Expose the port the application listens on
EXPOSE 3000

# Default command: run the backend entrypoint.
# If your build emits a compiled file under backend/dist, change this to backend/dist/app.js
CMD ["node", "backend/src/app.js"]
