# 🚀 HabitFlow AI - Web Frontend Deployment Guide

This guide will help you deploy your HabitFlow AI web frontend to Vercel and connect it to your backend API.

## 📋 Prerequisites

- GitHub account (for Vercel deployment)
- Vercel account (free)
- Backend API deployed (Railway, Render, or your preferred platform)

## 🎯 Quick Start

### 1. Environment Setup

Create a `.env.local` file in your project root:

```bash
# Frontend Environment Variables (Local Development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production, you'll set the environment variable in Vercel dashboard.

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from your project directory:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? `N`
   - Project name: `habitflow-ai-web` (or your preferred name)
   - Deploy directory: `./` (current directory)

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables in Vercel

After deployment, add environment variables:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-api.com` | Production, Preview, Development |

**Important:** Replace `https://your-backend-api.com` with your actual backend API URL.

### 4. Backend API Setup

Make sure your FastAPI backend includes CORS configuration for your frontend domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-vercel-app.vercel.app",  # Your Vercel domain
        "https://habitflow-ai.your-domain.com"  # Custom domain if you have one
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### Example DNS Configuration

If your domain is `habitflow.com`:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `cname.vercel-dns.com` |
| A | `@` | `76.76.19.19` |

## 🔧 Configuration Files

### `vercel.json`
Already created in your project with optimal settings for Next.js deployment.

### `next.config.js`
Your existing configuration should work perfectly with Vercel.

### `package.json`
Make sure your scripts are properly configured:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📊 Testing the Deployment

After deployment:

1. **Frontend Test:**
   - Visit your Vercel URL
   - Try creating a user account
   - Test navigation between different views

2. **API Connection Test:**
   - Try creating a habit
   - Check if data persists (should work even without backend in demo mode)
   - Test habit tracking functionality

3. **Performance Test:**
   - Check page load speeds
   - Test mobile responsiveness
   - Verify all components render correctly

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue: "API connection failed"
**Solution:** Check your `NEXT_PUBLIC_API_BASE_URL` environment variable in Vercel settings.

#### Issue: "Build failed" 
**Solution:** 
- Check for TypeScript errors: `npm run build` locally
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

#### Issue: "CORS error"
**Solution:** Update your backend CORS configuration to include your Vercel domain.

#### Issue: "Environment variables not working"
**Solution:** 
- Ensure env vars start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check Environment Variables section in Vercel dashboard

### Debug Commands

```bash
# Test local build
npm run build

# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL

# Verify Vercel deployment
vercel --debug
```

## 🚀 Going Live Checklist

- [ ] Backend API deployed and accessible
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS properly configured on backend
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test all functionality end-to-end
- [ ] Performance optimization complete

## 📈 Post-Deployment

### Analytics (Optional)
Add Vercel Analytics to track usage:

1. Go to your Vercel project
2. Navigate to Analytics tab
3. Enable Web Analytics

### Monitoring
- Monitor API response times
- Check error logs in Vercel dashboard
- Set up uptime monitoring for your API

### Updates
- Use `vercel --prod` for production deployments
- Enable automatic deployments from your main branch
- Use preview deployments for testing changes

## 🎯 Next Steps

Once deployed, you can:

1. **Share your app:** Your Vercel URL is ready to share!
2. **Collect feedback:** Get users to test your MVP
3. **Monitor usage:** Use Vercel Analytics to see user behavior
4. **Scale:** Upgrade Vercel plan if needed for higher limits

Your HabitFlow AI web app is now live and ready for users! 🌟

---

**Need help?** Check the troubleshooting section or refer to [Vercel's documentation](https://vercel.com/docs).
