#!/bin/bash
set -e

# Default to SQLite for quick local standalone testing if PostgreSQL service is not configured
export DATABASE_URL="${DATABASE_URL:-sqlite:///./aml_dev.db}"
export ENVIRONMENT="development"
export DEBUG="True"

echo "=== Starting AML Backend Server ==="
echo "Database URL: $DATABASE_URL"
echo "Listening on: http://0.0.0.0:8000"
echo "Interactive Swagger Docs: http://localhost:8000/docs"
echo "Redoc: http://localhost:8000/redoc"

exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
