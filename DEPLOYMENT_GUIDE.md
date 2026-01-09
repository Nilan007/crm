# 🚀 Techxl Intelligence System (TIS) - Render Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough to deploy your MERN stack application to **Render.com**. 
The application will be deployed as two separate services:
1.  **Backend**: A Web Service (Node.js/Express)
2.  **Frontend**: A Static Site (React/Vite)

---

## 🛠️ Step 1: Deploy the Backend
The backend runs the API, connects to MongoDB, and handles Socket.io.

1.  **Log in to Render**:
    *   Go to [Render.com](https://render.com) and log in.

2.  **Create Service**:
    *   Click **"New +"** and select **"Web Service"**.
    *   Connect your GitHub repository: `NilanRitvik/crm`.

3.  **Configure Settings**:
    *   **Name**: `tis-backend` (or a unique name)
    *   **Root Directory**: `backend` (Important! This tells Render where the server code is)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`

4.  **Environment Variables**:
    *   Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**. Add the following:

    | Key            | Value                                                                 | Description |
    |----------------|-----------------------------------------------------------------------|-------------|
    | `MONGO_URI`    | `mongodb+srv://adminUser:5POPDN5Cwf2IipzZ@cluster0.ev4kdjx.mongodb.net/` | Your Atlas MongoDB connection string |
    | `JWT_SECRET`   | `your_jwt_secret` (or generate a secure random string)                | Secure key for authentication |
    | `PORT`         | `5000`                                                                | Server port |
    | `FRONTEND_URL` | `https://placeholder.com`                                             | **Temporary value**. We will update this after deploying the frontend. |

5.  **Deploy**:
    *   Click **"Create Web Service"**.
    *   Wait for the build to finish. You should see `MongoDB Connected ✅` in the logs.
    *   **Copy the Backend URL** (e.g., `https://tis-backend-xyz.onrender.com`) from the top left corner. You need this for the Frontend.

---

## 🎨 Step 2: Deploy the Frontend
The frontend is the React interface that users interact with.

1.  **Create Service**:
    *   Click **"New +"** and select **"Static Site"**.
    *   Connect the **SAME** GitHub repository: `NilanRitvik/crm`.

2.  **Configure Settings**:
    *   **Name**: `tis-frontend` (or a unique name)
    *   **Root Directory**: `frontend/my-react-app` (Crucial! This is where your React app lives)
    *   **Build Command**: `npm install; npm run build`
    *   **Publish Directory**: `dist` (Vite builds the app to this folder)

3.  **Environment Variables**:
    *   We need to tell the frontend where the backend lives.
    *   Add this variable:

    | Key            | Value                                      | Description |
    |----------------|--------------------------------------------|-------------|
    | `VITE_API_URL` | `https://tis-backend-xyz.onrender.com`     | **Paste the Backend URL** you copied in Step 1. |

4.  **⚠️ CRITICAL: Rewrite Rule**:
    *   Render Static Sites need a rewrite rule to handle React Router navigation (e.g., refreshing on `/proposals` page).
    *   Go to the **Redirects/Rewrites** tab (or "Advanced" section).
    *   Add a rule:
        *   **Source**: `/*`
        *   **Destination**: `/index.html`
        *   **Action**: `Rewrite`

5.  **Deploy**:
    *   Click **"Create Static Site"**.
    *   Wait for deployment. Once live, **Copy the Frontend URL** (e.g., `https://tis-frontend-abc.onrender.com`).

---

## 🔗 Step 3: Link Frontend to Backend (Finalize CORS)
Now that the Frontend is live, we must tell the Backend to allow connections from it.

1.  Go back to your **Backend Service** (Web Service) in the Render dashboard.
2.  Go to the **Environment** tab.
3.  Find the `FRONTEND_URL` variable.
4.  Edit it and replace `https://placeholder.com` with your **Actual Frontend URL** (from Step 2).
    *   Example: `https://tis-frontend-abc.onrender.com`
    *   *Note: Do not include a trailing slash.*
5.  Click **"Save Changes"**. Render will automatically restart the backend server.

---

## 🎉 Verification
1.  Open your **Frontend URL** in a browser.
2.  Login or Register.
3.  Check the "Proposals" or "Leads" page to ensure data is loading from the database.
4.  **Troubleshooting**:
    *   If you see "Network Error" or data doesn't load:
        *   Open Browser Developer Tools (F12) -> Console.
        *   If you see "CORS error", check Step 3 (Backend `FRONTEND_URL`).
        *   If you see "404 Not Found" for everything, check Step 2 Rewrite Rule.
    *   Check Backend Logs in Render for "MongoDB connection" errors (Fix Step 1 `MONGO_URI`).

**Deployment Complete!** 🚀
