#!/bin/sh
set -e

echo "=========================================================="
echo " Starting AML Detection & Graph Analytics Server (Railway)"
echo " Listening on PORT: ${PORT:-8000}"
echo "=========================================================="

# Auto-seed initial sample data on startup if needed
python scripts/seed_data.py || echo "Warning: Seed data script encountered an issue or database already contains data. Continuing startup..."

# Start Uvicorn bound to Railway dynamic PORT
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
