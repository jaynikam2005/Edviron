# Render Deployment Guide for Edviron

## Overview
This project deploys as a monorepo with separate backend (NestJS) and frontend (React + Vite) services on Render.

## Services Configuration

### Backend Service (Web Service)
- **Type**: Web Service
- **Environment**: Node.js 18
- **Build Command**: `npm run render-build`
- **Start Command**: `npm run render-start`
- **Health Check**: `/api/health`
- **Port**: 10000 (Render default)

### Frontend Service (Static Site)
- **Type**: Static Site
- **Build Command**: `cd edviron-frontend && npm install && npm run build:prod`
- **Publish Directory**: `./edviron-frontend/dist`
- **SPA Routing**: Configured with rewrites

## Environment Variables (Backend)

Set these in your Render backend service:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-app.onrender.com
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Steps

### 1. Create Backend Service
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run render-start`
   - **Environment**: Node.js 18
   - Add environment variables listed above

### 2. Create Frontend Service
1. Go to Render Dashboard → New → Static Site
2. Connect the same GitHub repository
3. Configure:
   - **Build Command**: `cd edviron-frontend && npm install && npm run build:prod`
   - **Publish Directory**: `./edviron-frontend/dist`

### 3. Configure Frontend Routing
Add these redirects/rewrites in your frontend service settings:
- `/api/*` → `https://your-backend-service.onrender.com/api/*`
- `/*` → `/index.html` (for SPA routing)

## File Structure
```
├── src/                 # NestJS backend source
├── edviron-frontend/    # React frontend source
├── package.json         # Backend dependencies & scripts
├── render.yaml          # Render configuration (optional)
└── RENDER_DEPLOYMENT.md # This guide
```

## Build Process
1. **Backend**: Compiles TypeScript → `dist/` directory
2. **Frontend**: Vite builds React app → `edviron-frontend/dist/`
3. **Runtime**: Backend serves API at `/api/*`, frontend serves static files

## Health Checks
- Backend: `GET /api/health`
- Frontend: Automatic (static site)

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18)
- Verify all environment variables are set
- Check build logs for dependency issues

### 404 Errors
- Ensure frontend rewrites are configured correctly
- Verify backend service URL in frontend environment
- Check CORS settings in backend

### Database Connection
- Verify MongoDB connection string
- Check network access settings
- Ensure database user has proper permissions

## Performance Optimization
- Frontend served from CDN (automatic with Render)
- Backend autoscaling available on paid plans
- Health checks ensure service availability