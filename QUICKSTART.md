# Quick Start Guide

Get PDF Extraction Playground up and running in minutes!

## 🚀 Fast Track Setup

### Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check Python (need 3.11+)
python --version

# Check Git
git --version
```

---

## Option 1: Local Development (Fastest)

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Seaweed-Boi/PDF-Playground.git
cd PDF-Playground
```

### Step 2: Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at: **http://localhost:8000**
API docs available at: **http://localhost:8000/docs**

### Step 3: Frontend Setup (3 minutes)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

### Step 4: Complete Missing Components

The frontend needs a few more components. Create these files:

```bash
cd src/components

# Create model-selector.tsx
# Create extraction-view.tsx
# Create pdf-viewer.tsx
# Create markdown-viewer.tsx
```

Or install Shadcn/UI components:

```bash
# Initialize Shadcn
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert
```

---

## Option 2: Cloud Deployment (Production)

### Backend on Modal (10 minutes)

```bash
cd backend

# Install Modal
pip install modal

# Setup Modal account
modal setup

# Create secrets
modal secret create pdf-extraction-secrets

# Deploy!
modal deploy modal_app.py

# Note your deployment URL (e.g., https://xxx.modal.run)
```

### Frontend on Vercel (5 minutes)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod

# Update NEXT_PUBLIC_API_URL with your Modal URL
# Redeploy after updating
```

---

## 🎯 Quick Test

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/api/v1/models/

# Upload test PDF
curl -X POST http://localhost:8000/api/v1/extract/single \
  -F "file=@test.pdf" \
  -F "model=docling"
```

### Test Frontend

1. Open http://localhost:3000
2. Drag and drop a PDF
3. Select a model
4. Click "Extract"
5. View results!

---

## 🔧 Common Issues & Quick Fixes

### Backend Issues

**Issue**: Module not found
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Issue**: Port already in use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

**Issue**: Model loading errors
```bash
# Models will download on first use
# Ensure internet connection
# Wait for models to cache (~5GB)
```

### Frontend Issues

**Issue**: Dependencies not installing
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Build errors
```bash
# Check Node version (need 18+)
node --version

# Update Node if needed
nvm install 18
nvm use 18
```

**Issue**: API connection fails
```bash
# Check backend is running
curl http://localhost:8000/health

# Update .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📦 What's Included

### Backend ✅
- FastAPI application
- 3 PDF extraction models (Docling, MinerU, Surya)
- RESTful API endpoints
- Visual annotation generation
- Modal deployment configuration
- Error handling & logging

### Frontend ✅
- Next.js 14 application
- TypeScript configuration
- Tailwind CSS styling
- API client setup
- State management (Zustand)
- Theme provider (dark/light mode)
- Base components

### Documentation ✅
- Comprehensive README
- API documentation
- Deployment guide
- Contributing guide
- Project summary

---

## 🎨 Recommended Development Flow

1. **Start Backend First**
   - Ensures API is available
   - Test endpoints with curl/Postman
   - Check logs for any errors

2. **Then Start Frontend**
   - Frontend connects to backend
   - Test file upload
   - Verify API integration

3. **Develop Incrementally**
   - Add one feature at a time
   - Test as you go
   - Commit frequently

4. **Deploy Early, Deploy Often**
   - Test in production environment
   - Catch deployment issues early
   - Get real user feedback

---

## 🆘 Need Help?

### Check Documentation
1. Main README.md - Complete guide
2. DEPLOYMENT.md - Deployment steps
3. PROJECT_SUMMARY.md - Architecture overview
4. Backend README - API details
5. Frontend README - Component structure

### Debug Tips

**Enable verbose logging:**

Backend:
```python
# In app/main.py
logger.add(sys.stdout, level="DEBUG")
```

Frontend:
```typescript
// In next.config.js
module.exports = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

**Check browser console:**
- F12 or Cmd+Option+I
- Console tab for errors
- Network tab for API calls

**Check backend logs:**
```bash
# Terminal running uvicorn shows requests
# Look for errors and stack traces
```

---

## 🎓 Learning Resources

### FastAPI
- Docs: https://fastapi.tiangolo.com/
- Tutorial: https://fastapi.tiangolo.com/tutorial/

### Next.js
- Docs: https://nextjs.org/docs
- Learn: https://nextjs.org/learn

### Modal
- Docs: https://modal.com/docs
- Examples: https://modal.com/docs/examples

### Tailwind CSS
- Docs: https://tailwindcss.com/docs
- Play: https://play.tailwindcss.com/

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Backend running on http://localhost:8000
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Health check returns "healthy"
- [ ] Frontend running on http://localhost:3000
- [ ] No console errors in browser
- [ ] File upload form visible
- [ ] Model selection working
- [ ] Can upload a test PDF
- [ ] Extraction completes successfully
- [ ] Results display correctly

---

## 🚀 Ready to Deploy?

See **DEPLOYMENT.md** for complete deployment guide!

Quick deploy:
```bash
# Backend
modal deploy modal_app.py

# Frontend
vercel --prod
```

---

## 💡 Pro Tips

1. **Use Docker** for consistent environment
2. **Set up pre-commit hooks** for code quality
3. **Enable hot reload** for faster development
4. **Use environment variables** for configuration
5. **Test with various PDFs** (simple, complex, scanned)
6. **Monitor performance** from the start
7. **Write tests** as you develop
8. **Document as you go**

---

## 🎉 You're All Set!

Your PDF Extraction Playground is ready to use!

**Next steps:**
1. Test with sample PDFs
2. Explore different models
3. Try comparison feature
4. Check annotation quality
5. Customize UI to your liking
6. Deploy to production
7. Share with users!

**Questions?** Open an issue on GitHub!

**Happy extracting! 🎊**
