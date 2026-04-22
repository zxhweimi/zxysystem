# ============================================================
# Dockerfile - 人体关节监测传感器仿真系统
# Zeabur 部署用：前端（nginx）+ 后端（Flask）一体化
# ============================================================

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public

# Build with API URL env var (will be replaced by Zeabur)
ENV REACT_APP_API_URL=/api
RUN npm run build

# Stage 2: Production server
FROM python:3.11-slim

WORKDIR /app

# Install Flask and dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Install nginx
RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R www-data:www-data /app/frontend/build \
    && chmod -R 755 /app/frontend/build

# Copy nginx and startup config
COPY deploy/nginx.conf /etc/nginx/sites-available/default
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
