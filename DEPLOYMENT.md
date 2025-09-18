# Edviron - Vercel Deployment Guide

## 🚀 Quick Deployment

This project is configured for seamless deployment on Vercel with both frontend and backend.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up your database at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub

### Environment Variables

#### Required Environment Variables for Vercel:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: **Other** (for monorepo)
   - Root Directory: **/** (keep as root)
   - Build Command: `npm run build && cd edviron-frontend && npm run build`
   - Output Directory: `edviron-frontend/dist`

3. **Set Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all the required environment variables from above

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

#### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel --prod

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: edviron (or your preferred name)
# - In which directory is your code located? ./
```

### Project Structure

```
edviron/
├── api/                    # Vercel serverless functions
│   └── index.ts           # Backend entry point
├── src/                   # NestJS backend source
├── edviron-frontend/      # React frontend
│   ├── src/
│   ├── dist/             # Build output
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Backend dependencies
```

### API Routes

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.vercel.app/api`
- **Health Check**: `https://your-app-name.vercel.app/api/health`

### Post-Deployment Setup

1. **Seed Demo Data**:
   ```bash
   # Create demo user (run once)
   node src/scripts/create-demo-user.js

   # Seed demo data (run once)
   node src/scripts/seed-demo-data.js
   ```

2. **Test the Application**:
   - Visit your deployed app
   - Try logging in with demo credentials: `admin@edviron.com` / `admin123`
   - Verify API endpoints are working

### Troubleshooting

#### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compiles without errors
   - Verify environment variables are set

2. **API Routes Not Working**:
   - Check `vercel.json` configuration
   - Verify the `api/index.ts` file exists
   - Check Vercel function logs

3. **CORS Errors**:
   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in `main.ts`

4. **Database Connection Issues**:
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

### Performance Optimizations

- ✅ Static asset caching configured
- ✅ Gzip compression enabled
- ✅ Security headers set
- ✅ Serverless functions optimized
- ✅ Database connection pooling

---

## 🎉 Your Edviron app is now live on Vercel!

After deployment, your application will be available at:
- **Production URL**: `https://your-app-name.vercel.app`
- **API Endpoint**: `https://your-app-name.vercel.app/api`

The deployment includes:
- ⚡ Fast global CDN
- 🔒 HTTPS by default
- 🚀 Serverless backend
- 📱 Mobile optimized
- 🔧 Auto-deployments on push
   - `VITE_API_BASE_URL`: Your backend API URL
   - `NODE_VERSION`: 18

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. From project root: `vercel --cwd edviron-frontend`
3. Configure environment variables in Vercel dashboard
4. Set up automatic deployments from GitHub

### Option 3: GitHub Pages
1. Add to `edviron-frontend/package.json`:
   ```json
   "homepage": "https://yourusername.github.io/edviron",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
2. Install: `npm install --save-dev gh-pages`
3. Deploy: `npm run deploy`

## Backend Deployment

### Option 1: Railway
1. Install Railway CLI
2. From project root: `railway login && railway init`
3. Add environment variables in Railway dashboard
4. Deploy: `railway up`

### Option 2: Render
1. Connect GitHub repository
2. Set:
   - Build command: `npm install`
   - Start command: `npm run start:prod`
   - Environment: Node.js
3. Configure environment variables

### Option 3: Heroku
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set VAR=value`
4. Deploy: `git push heroku main`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
PORT=3000
NODE_ENV=production
EDVIRON_API_KEY=your-api-key
EDVIRON_API_SECRET=your-api-secret
EDVIRON_BASE_URL=https://api.edviron.com
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_APP_TITLE=Edviron Transaction Dashboard
```

## DNS Configuration
After deployment, update your DNS settings to point to the deployment URLs.

## SSL Certificates
Both Netlify and Vercel provide automatic SSL certificates. For custom domains, ensure SSL is enabled.