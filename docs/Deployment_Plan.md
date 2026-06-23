# Zomata AI - Deployment Plan

This document outlines the step-by-step plan to deploy the Zomata AI application. The architecture is split into a frontend (React + Vite) and a backend (FastAPI + Python). 

Based on the requirements:
- **Backend**: Deployed on [Railway](https://railway.app/)
- **Frontend**: Deployed on [Vercel](https://vercel.com/)

---

## 1. Preparation

Before deploying, ensure your code is pushed to a GitHub repository. Both Railway and Vercel will integrate seamlessly with your GitHub repository for continuous integration and deployment (CI/CD).

1. Initialize a Git repository if not already done.
2. Ensure both `/backend` and `/frontend` directories are committed.
3. Push the repository to GitHub.

---

## 2. Backend Deployment on Railway

Railway is an excellent platform for deploying backend services, especially Python/FastAPI applications.

### Steps:

1. **Sign in to Railway:** Go to [Railway](https://railway.app/) and log in with your GitHub account.
2. **Create a New Project:** Click on "New Project" and select "Deploy from GitHub repo".
3. **Select Repository:** Choose the Zomata AI repository.
4. **Configure the Service:**
   - Since the backend is in a subfolder, you need to configure the **Root Directory** for the service.
   - Go to the **Settings** tab of the newly created service.
   - Set the **Root Directory** to `/backend`.
5. **Set the Start Command:**
   - Railway might auto-detect the start command from `requirements.txt`.
   - To be safe, set the custom start command under **Settings > Deploy > Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
     *(Note: Replace `app.main:app` with your actual entry point if it's named differently).*
6. **Environment Variables:**
   - Go to the **Variables** tab.
   - Add all the variables from your backend `.env` file (e.g., `GROQ_API_KEY`).
7. **Deploy:** Railway will automatically build and deploy your application. Once successful, generate a public domain in the **Settings > Networking** section.

**Save the generated Railway URL (e.g., `https://your-backend.up.railway.app`). You will need this for the frontend configuration.**

---

## 3. Frontend Deployment on Vercel

Vercel is optimized for frontend frameworks and has built-in support for Vite and React.

### Steps:

1. **Sign in to Vercel:** Go to [Vercel](https://vercel.com/) and log in with your GitHub account.
2. **Add New Project:** Click on "Add New..." and select "Project".
3. **Import Repository:** Find your Zomata AI GitHub repository and click "Import".
4. **Configure Project:**
   - **Framework Preset:** Vercel should auto-detect **Vite**. If not, select it manually.
   - **Root Directory:** Click "Edit" and select the `frontend` folder.
   - **Build and Output Settings:** Leave the default Vite settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
5. **Environment Variables:**
   - Add any environment variables needed by the frontend.
   - **Crucially**, add the backend API URL. For example, if your frontend fetches from `import.meta.env.VITE_API_URL`, add:
     - Name: `VITE_API_URL`
     - Value: `<YOUR_RAILWAY_BACKEND_URL>`
6. **Deploy:** Click "Deploy". Vercel will install dependencies, build the frontend, and deploy it globally.
7. **Verify:** Once the deployment is complete, Vercel will provide a public URL (e.g., `https://zomata-frontend.vercel.app`).

---

## 4. Post-Deployment Checklist

- [ ] **Test API Connectivity:** Visit the Vercel frontend URL and verify that it successfully communicates with the Railway backend.
- [ ] **CORS Configuration:** Ensure your FastAPI backend has CORS configured to allow requests from your new Vercel domain. (Update `app.add_middleware(CORSMiddleware, allow_origins=["https://your-vercel-app.vercel.app"])` in the backend).
- [ ] **Monitor Logs:** Check the logs in both Vercel and Railway for any runtime errors.

