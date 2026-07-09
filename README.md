# 🏘️ LocalHub — Smart Community Service & Local Marketplace Platform

> A full-stack marketplace connecting local buyers, sellers, and service providers with real-time messaging, Stripe payments, and an admin dashboard.

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://your-app.vercel.app)
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://your-api.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Marketplace** | Browse, search and filter products by category, price & city |
| 💼 **Services** | Discover and book freelance/local services with packages |
| 💳 **Stripe Payments** | Secure card payments via Stripe with webhook confirmation |
| 💬 **Real-time Chat** | Socket.IO powered messaging between buyers & sellers |
| 🔔 **Notifications** | Live in-app notifications for bookings, messages, reviews |
| ⭐ **Reviews & Ratings** | Verified buyer reviews with seller reply capability |
| ❤️ **Favorites** | Save products & services to wishlists |
| 🔐 **Auth** | JWT access + refresh tokens, email verification, password reset |
| 🛡️ **Admin Panel** | User management, listing moderation, reports, revenue analytics |
| 📧 **Contact Form** | Public contact form saved to admin reports + email notification |
| ☁️ **Image Upload** | Cloudinary-powered image management |
| 📱 **Responsive** | Mobile-first design with dark glassmorphism UI |

---

## 🧱 Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components)
- **TypeScript** — strict type safety
- **Tailwind CSS** (custom design system)
- **Zustand** — global state (auth, notifications)
- **Socket.IO Client** — real-time events
- **Stripe.js** — PCI-compliant payment UI
- **Recharts** — analytics charts

### Backend
- **Express.js 5** + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **Socket.IO** — real-time bidirectional events
- **Stripe** — payment intents & webhooks
- **Nodemailer** + Gmail SMTP — transactional email
- **Cloudinary** — image storage & transformation
- **JWT** — stateless authentication
- **bcryptjs** — password hashing
- **Helmet** + **express-rate-limit** — security

---

## 📁 Project Structure

```
Project3/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml    # Render CI/CD
│       └── deploy-frontend.yml   # Vercel CI/CD
├── backend/
│   ├── src/
│   │   ├── config/          # DB + Cloudinary
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── socket/          # Socket.IO server
│   │   └── server.ts        # Entry point
│   ├── .env                 # Local env vars
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router pages
    │   ├── components/      # Reusable UI components
    │   ├── lib/             # API client, utils
    │   ├── store/           # Zustand stores
    │   └── types/           # TypeScript types
    ├── .env.local           # Local env vars
    └── package.json
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js ≥ 20
- MongoDB Atlas account (free tier works)
- Stripe account (test mode)
- Cloudinary account (free tier)
- Gmail account with App Password enabled

### 1. Clone the repo

```bash
git clone https://github.com/abaid9658/Smart-Community-Service-Local-Marketplace-Platform.git
cd Smart-Community-Service-Local-Marketplace-Platform
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.production .env   # Then edit .env with your credentials
npm run dev               # Starts on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." >> .env.local
npm run dev               # Starts on http://localhost:3000
```

### 4. Seed Database (optional)

```bash
cd backend
npm run db:seed
```

---

## 🌐 API Endpoints

| Resource | Base Path |
|---|---|
| Auth | `POST /api/v1/auth/register`, `/login`, `/logout`, `/refresh` |
| Users | `GET /api/v1/users/profile/:username`, `PUT /api/v1/users/profile` |
| Products | `GET/POST /api/v1/products`, `GET /api/v1/products/:id` |
| Services | `GET/POST /api/v1/services`, `GET /api/v1/services/:id` |
| Bookings | `POST /api/v1/bookings`, `GET /api/v1/bookings/my` |
| Payments | `POST /api/v1/payments/create-intent`, `/confirm`, `/webhook` |
| Messages | `GET /api/v1/messages/conversations`, `POST /.../messages` |
| Notifications | `GET /api/v1/notifications`, `PUT /.../read-all` |
| Reviews | `POST /api/v1/reviews`, `GET /api/v1/reviews` |
| Admin | `GET /api/v1/admin/stats`, `/pending-listings`, `/reports` |
| Contact | `POST /api/v1/contact` |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000

MONGODB_URI=mongodb+srv://...

JWT_ACCESS_SECRET=strong_random_secret_here
JWT_REFRESH_SECRET=another_strong_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="LocalHub <your@gmail.com>"

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🚢 Deployment

### Backend → Render

1. Go to [Render](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. Add all env variables from the table above in the Render dashboard
7. Set `FRONTEND_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`)
8. Copy the **Deploy Hook URL** and add it as `RENDER_DEPLOY_HOOK_URL` in GitHub Secrets

### Frontend → Vercel

1. Go to [Vercel](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL + `/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL` = your Render backend URL
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your Stripe publishable key
5. Deploy!

### CI/CD (GitHub Actions)

Workflows auto-trigger on push to `main`:
- **Backend changes** → TypeScript check → Build → Trigger Render deploy hook
- **Frontend changes** → TypeScript check → Deploy to Vercel via Vercel Action

Add these **GitHub Secrets**:
| Secret | Where to find |
|---|---|
| `VERCEL_TOKEN` | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link` |
| `RENDER_DEPLOY_HOOK_URL` | Render → Service Settings → Deploy Hooks |

### Update CORS After Deployment

Once deployed, update `FRONTEND_URL` in Render env vars:
```
FRONTEND_URL=https://smart-community-service.vercel.app,http://localhost:3000
```
The backend CORS config already supports comma-separated origins and all `*.vercel.app` subdomains automatically.

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| `USER` | Browse, favorite, book services, send messages, write reviews |
| `SELLER` | All USER + create/manage product listings |
| `SERVICE_PROVIDER` | All USER + create/manage service listings, receive bookings |
| `ADMIN` | All + moderate listings, manage users, view reports & analytics |
| `SUPER_ADMIN` | All + cannot be suspended |

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Abaid Ghouri**
- GitHub: [@abaid9658](https://github.com/abaid9658)
- Email: abaidghouri0@gmail.com
