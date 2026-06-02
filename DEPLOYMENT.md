# 🚀 Classpedia Publisher Area - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to your hosting provider (Netlify, Vercel, AWS, etc.)

---

## 🏗️ Build Commands

### **Development Build**
```bash
npm run dev
```
Starts development server on `http://localhost:5173`

### **Production Build**
```bash
npm run build
```
Creates optimized production build in `dist/` folder

### **Preview Production Build**
```bash
npm run preview
```
Preview the production build locally before deployment

### **Type Check**
```bash
npm run typecheck
```
Run TypeScript type checking

### **Lint Code**
```bash
npm run lint
```
Check code for errors and warnings

---

## 📦 Build Output

After running `npm run build`, the production-ready files will be in:
```
dist/
├── assets/          # Compiled JS, CSS, and other assets
├── index.html       # Main HTML file
└── ...              # Other static files
```

---

## 🌐 Deployment Options

### **Option 1: Netlify (Recommended)**

#### **Via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### **Via Netlify UI:**
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `18` or higher
5. Click "Deploy site"

#### **Environment Variables (if needed):**
- Go to Site settings → Environment variables
- Add any required variables (e.g., API keys)

---

### **Option 2: Vercel**

#### **Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

#### **Via Vercel UI:**
1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

---

### **Option 3: AWS S3 + CloudFront**

```bash
# Build the project
npm run build

# Install AWS CLI (if not installed)
# https://aws.amazon.com/cli/

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

### **Option 4: GitHub Pages**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Note:** Update `vite.config.js` to set the correct base path:
```javascript
export default defineConfig({
  base: '/your-repo-name/', // For GitHub Pages
  // ... rest of config
})
```

---

### **Option 5: Docker Container**

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t classpedia-publisher .
docker run -p 80:80 classpedia-publisher
```

---

## 🔧 Build Optimization

### **Vite Configuration**

Update `vite.config.js` for production optimizations:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from "@base44/vite-plugin"

export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
  }
})
```

---

## 🌍 Environment Variables

Create `.env.production` for production environment:

```env
# API Configuration
VITE_API_BASE_URL=https://class.thetechmenders.com/api

# Base44 Configuration (if needed)
VITE_BASE44_APP_BASE_URL=your_base44_url_here

# Other configurations
VITE_APP_NAME=Classpedia Publishing
```

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the app.

---

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Check all API endpoints are pointing to production URLs
- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow
- [ ] Test all critical user paths
- [ ] Check responsive design on mobile/tablet
- [ ] Verify all images and assets load correctly
- [ ] Test error handling and edge cases
- [ ] Check browser console for errors
- [ ] Verify SEO meta tags (if applicable)
- [ ] Test performance with Lighthouse

---

## 🔍 Troubleshooting

### **Build fails with memory error:**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### **404 errors on page refresh (SPA routing):**
Configure your server to redirect all routes to `index.html`:

**Netlify:** Create `_redirects` file in `public/`:
```
/*    /index.html   200
```

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### **Assets not loading:**
Check the `base` path in `vite.config.js` matches your deployment URL structure.

---

## 📊 Performance Monitoring

After deployment, monitor:
- Page load times
- API response times
- Error rates
- User engagement metrics

Use tools like:
- Google Analytics
- Sentry (for error tracking)
- Lighthouse (for performance audits)

---

## 🔄 CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      with:
        args: deploy --prod --dir=dist
```

---

## 📝 Quick Deploy Commands

### **One-line deploy to Netlify:**
```bash
npm run build && netlify deploy --prod --dir=dist
```

### **One-line deploy to Vercel:**
```bash
npm run build && vercel --prod
```

### **Build and preview locally:**
```bash
npm run build && npm run preview
```

---

## 🎯 Recommended Hosting

For this React + Vite application, we recommend:

1. **Netlify** - Best for simplicity and automatic deployments
2. **Vercel** - Excellent performance and developer experience
3. **AWS Amplify** - Good for AWS ecosystem integration
4. **Cloudflare Pages** - Great global CDN and free tier

All support:
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Git-based deployments
- ✅ Environment variables
- ✅ SPA routing support

---

## 📞 Support

For deployment issues:
1. Check build logs for errors
2. Verify all environment variables are set
3. Test locally with `npm run preview`
4. Check hosting provider documentation
5. Review this deployment guide

---

**Last Updated:** June 2, 2026
**App Version:** 0.0.0
**Node Version Required:** 18+
