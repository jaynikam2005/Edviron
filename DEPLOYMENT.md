# Deployment Instructions

## Frontend Deployment

### Option 1: Netlify
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Base directory: `edviron-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configure environment variables:
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