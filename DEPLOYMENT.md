# Deployment Guide

## Architecture Overview

EchoChat consists of two parts:
- **Frontend**: Next.js application (deployable on Vercel)
- **Backend**: Express + Socket.IO server (requires long-running server)

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Steps

1. **Push code to GitHub** (already done)
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `Soumyaroy428/EchoChat`
   - Vercel will auto-detect Next.js from the `vercel.json` configuration
   - Click "Deploy"

3. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
     ```
   - Replace `your-backend-domain.com` with your deployed backend URL

## Backend Deployment (Railway/Render/Fly.io)

Since the backend uses Socket.IO for real-time messaging, it requires a long-running server with persistent WebSocket connections. Vercel's serverless functions are not suitable for this.

### Option 1: Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway project**
   ```bash
   cd server
   railway init
   railway up
   ```

3. **Configure Environment Variables in Railway**
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a secure random string
   - `TWILIO_ACCOUNT_SID`: Your Twilio account SID (optional)
   - `TWILIO_AUTH_TOKEN`: Your Twilio auth token (optional)
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (optional)
   - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

4. **Deploy**
   ```bash
   railway deploy
   ```

### Option 2: Render

1. **Create account at [render.com](https://render.com)**

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the `server` directory as root
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - Same variables as Railway above

4. **Deploy** - Render will auto-deploy on push

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth signup
   fly auth login
   ```

2. **Launch app**
   ```bash
   cd server
   fly launch
   ```

3. **Configure secrets**
   ```bash
   fly secrets set MONGODB_URI="your-mongodb-uri"
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set CORS_ORIGIN="your-frontend-url"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

## Post-Deployment Setup

1. **Update frontend environment variable**
   - Get your backend URL from Railway/Render/Fly.io
   - Update `NEXT_PUBLIC_SOCKET_URL` in Vercel project settings
   - Redeploy Vercel frontend

2. **Test the deployment**
   - Open your Vercel frontend URL
   - Test user registration and login
   - Test real-time messaging between two users

## MongoDB Setup

For production, use a hosted MongoDB service:

- **MongoDB Atlas** (Free tier available): [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Render MongoDB**: Available as an add-on in Render
- **Railway MongoDB**: Available as a service in Railway

Create a database and get the connection string to use as `MONGODB_URI`.

## Troubleshooting

### Socket.IO Connection Issues
- Ensure `NEXT_PUBLIC_SOCKET_URL` matches your backend URL exactly
- Check that CORS is configured correctly in backend
- Verify backend is running and accessible

### Build Errors
- Ensure all dependencies are installed in `package.json`
- Check that TypeScript compiles without errors
- Verify environment variables are set correctly

### Database Connection Issues
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes your deployment platform
- Check database user has necessary permissions
