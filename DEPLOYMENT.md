# Deployment Guide

Complete guide for deploying PDF Extraction Playground.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Modal)](#backend-deployment-modal)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **Modal Account**
   - Sign up at [modal.com](https://modal.com)
   - Get $30 free credit
   - Note your credentials

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect to GitHub
   - Free tier available

3. **GitHub Account**
   - Repository created
   - Code pushed

### Required Tools

```bash
# Modal CLI
pip install modal

# Vercel CLI
npm i -g vercel

# Git
git --version
```

---

## Backend Deployment (Modal)

### Step 1: Setup Modal

```bash
# Install Modal
pip install modal

# Setup authentication
modal setup
# Follow prompts to authenticate
```

### Step 2: Create Modal Secrets

```bash
# Create secret for environment variables
modal secret create pdf-extraction-secrets \
  ENVIRONMENT=production \
  MAX_FILE_SIZE=52428800 \
  RATE_LIMIT_PER_MINUTE=10
```

### Step 3: Test Deployment Locally

```bash
cd backend

# Test Modal app locally
modal run modal_app.py
```

### Step 4: Deploy to Modal

```bash
# Deploy the application
modal deploy modal_app.py

# Output will show your deployment URL:
# ✓ Created web function => https://your-workspace--pdf-extraction-api-fastapi-app.modal.run
```

### Step 5: Verify Deployment

```bash
# Check deployment status
modal app list

# View logs
modal app logs pdf-extraction-api

# Test the API
curl https://your-app.modal.run/health
```

### Modal Configuration

The `modal_app.py` configures:
- **GPU**: NVIDIA T4
- **Timeout**: 600 seconds (10 minutes)
- **Image**: Debian Slim with Python 3.11
- **Volumes**: Persistent storage for model caching
- **Secrets**: Environment variables

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

```bash
cd frontend

# Ensure .gitignore is correct
# Commit all changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: Auto-detected from `vercel.json`
   - **Output Directory**: `.next`

4. Environment variables (auto-detected from `.env.production`):
   ```
   NEXT_PUBLIC_API_URL=https://seaweed-boi--pdf-extraction-api-fastapi-app.modal.run
   NEXT_PUBLIC_API_BASE_URL=https://seaweed-boi--pdf-extraction-api-fastapi-app.modal.run
   ```

5. Click "Deploy"
6. Your app will be live at `https://pdf-extraction-playground.vercel.app`

### Step 3: Deploy via CLI (Alternative)

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy

# For production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate

---

## Environment Configuration

### Backend Environment Variables

Create in Modal secrets:

```bash
modal secret create pdf-extraction-secrets \
  ENVIRONMENT=production \
  API_HOST=0.0.0.0 \
  API_PORT=8000 \
  MAX_FILE_SIZE=52428800 \
  ALLOWED_EXTENSIONS=pdf \
  RATE_LIMIT_PER_MINUTE=10 \
  MAX_PAGES=100 \
  DEFAULT_DPI=200 \
  MODEL_CACHE_DIR=/cache/models
```

### Frontend Environment Variables

Add in Vercel Dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-workspace--pdf-extraction-api-fastapi-app.modal.run
NEXT_PUBLIC_APP_NAME=PDF Extraction Playground
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

---

## Post-Deployment

### 1. Test the Application

```bash
# Test backend
curl https://your-backend.modal.run/health

# Test frontend
open https://your-app.vercel.app
```

### 2. Monitor Performance

**Modal Dashboard:**
- Check function invocations
- Monitor GPU usage
- Review logs

**Vercel Dashboard:**
- Monitor page views
- Check build times
- Review analytics

### 3. Set Up Monitoring

**Backend (Modal):**
```bash
# View real-time logs
modal app logs pdf-extraction-api --follow

# Check function stats
modal app stats pdf-extraction-api
```

**Frontend (Vercel):**
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Configure uptime monitoring

### 4. Update CORS

Update `backend/app/config.py`:
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your domain
]
```

Redeploy backend:
```bash
modal deploy modal_app.py
```

---

## Troubleshooting

### Backend Issues

**Issue: Modal deployment fails**
```bash
# Check Modal version
modal --version

# Reinstall Modal
pip install --upgrade modal

# Check secrets
modal secret list
```

**Issue: GPU memory errors**
- Reduce batch size in model services
- Use smaller model variants
- Increase timeout in `modal_app.py`

**Issue: Import errors**
```bash
# Verify all dependencies in requirements.txt
# Test locally first
modal run modal_app.py
```

### Frontend Issues

**Issue: Build fails on Vercel**
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Test build locally: `npm run build`

**Issue: API connection fails**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Test API endpoint directly

**Issue: Environment variables not working**
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Clear cache and rebuild

### Common Issues

**Issue: Rate limiting too strict**
Update `backend/app/config.py`:
```python
RATE_LIMIT_PER_MINUTE: int = 20  # Increase limit
```

**Issue: File upload fails**
- Check file size limit
- Verify Modal timeout is sufficient
- Ensure PDF is valid

**Issue: Annotations not generating**
- Check Poppler installation in Modal image
- Verify pdf2image dependencies
- Review logs for errors

---

## Performance Optimization

### Backend

1. **Enable model caching**
   - Models cached in Modal volume
   - Reduces cold start time

2. **Optimize GPU usage**
   - Process multiple pages in parallel
   - Batch inference when possible

3. **Implement caching**
   - Cache common extractions
   - Use Redis for results

### Frontend

1. **Enable CDN**
   - Automatic with Vercel
   - Static assets cached globally

2. **Optimize images**
   - Use Next.js Image component
   - Enable lazy loading

3. **Code splitting**
   - Automatic with Next.js
   - Reduces initial bundle size

---

## Scaling

### Backend Scaling (Modal)

Modal automatically scales:
- Concurrent requests → Multiple containers
- No traffic → Scales to zero
- High load → Automatic scaling

Configure in `modal_app.py`:
```python
@app.function(
    image=image,
    gpu="T4",
    timeout=600,
    container_idle_timeout=300,  # Keep warm for 5 min
    concurrency_limit=10,  # Max concurrent requests
)
```

### Frontend Scaling (Vercel)

Vercel automatically scales:
- Edge network globally
- Automatic CDN
- Serverless functions

---

## Cost Estimation

### Modal Costs

Free tier includes $30 credit:
- T4 GPU: ~$0.60/hour
- CPU: Minimal cost
- Storage: ~$0.10/GB/month

Estimated: **$5-20/month** for moderate use

### Vercel Costs

Free tier includes:
- 100GB bandwidth
- Unlimited deployments
- Serverless functions

Pro tier ($20/month) for production

---

## Security Checklist

- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File size limits set
- [ ] Input validation implemented
- [ ] HTTPS enabled (automatic)
- [ ] Secrets not in code
- [ ] Dependencies updated

---

## Next Steps

1. **Set up monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking
   - Uptime monitoring

2. **Add analytics**
   - User behavior tracking
   - Feature usage stats
   - Performance metrics

3. **Implement CI/CD**
   - Automated tests
   - Deployment pipeline
   - Preview deployments

4. **Documentation**
   - API documentation
   - User guide
   - Video tutorials

---

## Support

If you encounter issues:

1. Check logs:
   - Modal: `modal app logs pdf-extraction-api`
   - Vercel: Dashboard → Deployments → Logs

2. Review documentation:
   - [Modal Docs](https://modal.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)

3. Open an issue:
   - GitHub repository
   - Include error logs
   - Describe steps to reproduce

---

**Congratulations! Your PDF Extraction Playground is now deployed! 🎉**
