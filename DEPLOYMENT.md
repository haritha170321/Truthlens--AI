# 🚀 TruthGuard — Complete Production Deployment Guide

TruthGuard is structured as a 3-tier cloud application:
1. **Frontend**: React + Vite (Hosted on **Vercel** / Netlify)
2. **Backend**: Node.js + Express API (Hosted on **Render** / Railway)
3. **ML Service**: Python + FastAPI (Hosted on **Render** / Railway)
4. **Database**: MongoDB Atlas *(Already Configured & Live)*

---

## 📋 Step 0: Push Code to GitHub

If your project is not on GitHub yet, initialize git and push your repository:

```bash
git init
git add .
git commit -m "TruthGuard production release"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/FakeNews-Detector.git
git push -u origin main
```

---

## 🐍 Step 1: Deploy Python ML Service (Render.com)

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +"** → **"Web Service"**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `truthguard-ml-service`
   - **Region**: Closest to your users (e.g., `Oregon (US West)` or `Singapore`)
   - **Root Directory**: `ml-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python training/train_model.py`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Click **"Deploy Web Service"**.
5. Once deployed, copy your ML Service URL (e.g., `https://truthguard-ml-service.onrender.com`).

---

## 🟢 Step 2: Deploy Node.js Backend (Render.com)

1. In Render Dashboard, click **"New +"** → **"Web Service"**.
2. Select your repository.
3. Configure the settings:
   - **Name**: `truthguard-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. In the **"Environment Variables"** section, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.mongodb.net/fakenews_db?retryWrites=true&w=majority` |
   | `ML_SERVICE_URL` | `https://truthguard-ml-service.onrender.com` *(from Step 1)* |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here` |
   | `GEMINI_API_KEY` | `your_gemini_api_key_here` |
   | `NEWS_API_KEY` | `your_news_api_key_here` |
   | `FRONTEND_URL` | `https://your-frontend-app.vercel.app` *(update after Step 3)* |
5. Click **"Deploy Web Service"**.
6. Once deployed, copy your Backend API URL (e.g., `https://truthguard-backend.onrender.com`).

---

## ⚡ Step 3: Deploy React Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Import your GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
4. Expand **"Environment Variables"** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://truthguard-backend.onrender.com` *(from Step 2)* |
   | `VITE_GOOGLE_CLIENT_ID` | `your_google_oauth_client_id_here` |
5. Click **"Deploy"**.
6. Once complete, Vercel gives you your public live URL (e.g. `https://truthguard.vercel.app`)!

---

## 🔄 Step 4: Final Linkup

1. Go back to your **Render Backend Web Service** settings.
2. Update the `FRONTEND_URL` variable to your new Vercel production domain (e.g., `https://truthguard.vercel.app`).
3. Click Save to automatically redeploy.

🎉 **Your TruthGuard Fake News Detector is now 100% live on the internet!**
