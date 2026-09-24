# ==========================================
# Stage 1: Build the React + Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python Backend Runtime
# ==========================================
FROM python:3.11-slim AS production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    ENVIRONMENT=production \
    DEBUG=False

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Source Code
COPY backend/ /app/

# Copy Compiled Frontend SPA Distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port (overridden by Railway $PORT dynamically)
EXPOSE 8000

# Ensure entrypoint is executable
RUN chmod +x /app/scripts/entrypoint.sh

# Start the application using Railway entrypoint
CMD ["/app/scripts/entrypoint.sh"]
