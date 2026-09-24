# Railway Cloud Deployment Guide

This project is configured for **1-click automated deployment to [Railway.app](https://railway.app)** using a unified multi-stage Docker build.

The Docker container automatically:
1. Builds the React + Vite frontend SPA (`node:20-alpine`).
2. Packages the production FastAPI backend with PostgreSQL drivers & ML plugins (`python:3.11-slim`).
3. Seeds initial transactions on boot.
4. Binds dynamically to Railway's assigned `$PORT`.

---

## 🚀 Option 1: Deploy via GitHub (Recommended)

### Step 1: Push this codebase to GitHub

If you haven't initialized Git yet, run:

```bash
cd /root

# 1. Initialize git
git init
git add .
git commit -m "Production AML surveillance engine with pluggable ML & React dashboard"

# 2. Rename branch to main
git branch -M main

# 3. Add your remote GitHub repository
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 4. Push code
git push -u origin main
```

---

### Step 2: Deploy on Railway

1. Go to **[railway.app](https://railway.app)** and log in with GitHub.
2. Click **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will automatically detect the root [`Dockerfile`](file:///root/Dockerfile) and [`railway.json`](file:///root/railway.json).

---

### Step 3: Add Managed PostgreSQL on Railway

1. In your Railway project canvas, click **"+ New"** $\rightarrow$ **"Database"** $\rightarrow$ **"Add PostgreSQL"**.
2. Railway will provision a high-availability PostgreSQL 16/17 database in seconds.
3. Link the database to your service:
   - In your backend service settings, ensure `DATABASE_URL` references the PostgreSQL connection string `${{Postgres.DATABASE_URL}}`.
   - The backend includes a normalizer that automatically adapts `postgres://` to `postgresql+psycopg2://`.

---

### Step 4: Generate Public Domain

1. Click on your deployed web service in the Railway canvas.
2. Navigate to **"Settings"** $\rightarrow$ **"Networking"**.
3. Click **"Generate Domain"** (e.g. `aml-surveillance.up.railway.app`).
4. Open the URL in your browser:
   - **Live React UI:** `https://<your-project>.up.railway.app/` or `/dashboard`
   - **Interactive API Swagger Docs:** `https://<your-project>.up.railway.app/docs`

---

## ⚡ Option 2: Deploy via Railway CLI

If you prefer deploying directly from the terminal without GitHub:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd /root
railway init

# 4. Provision PostgreSQL
railway add -d postgres

# 5. Deploy
railway up
```

---

## ⚙️ Environment Variables Summary

| Variable | Required | Default / Example | Notes |
|:---|:---:|:---|:---|
| `PORT` | Auto | *Assigned by Railway* | The container dynamically binds Uvicorn to `${PORT:-8000}`. |
| `DATABASE_URL` | Yes | `postgresql+psycopg2://...` | Automatically injected by Railway when you add PostgreSQL. Falls back to SQLite if absent. |
| `ENVIRONMENT` | Optional | `production` | Set in Dockerfile. |
| `DEBUG` | Optional | `False` | Disables debug logs in production. |
| `SUSPICIOUS_THRESHOLD_HIGH` | Optional | `0.70` | Threshold for CRITICAL alert generation. |
| `SUSPICIOUS_THRESHOLD_MEDIUM` | Optional | `0.40` | Threshold for MEDIUM alert generation. |
