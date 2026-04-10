# 🏥 MediTrack — Smart Healthcare Management System

> **DevFusion Hackathon · Problem Statement #5 (#26ENMT5)**

A complete, full-stack healthcare web application connecting **patients**, **doctors**, and **hospital admins** — with AI-powered symptom analysis, telemedicine via Jitsi, digital prescriptions, medication reminders, and sandbox payment integration.

---

## 📋 Table of Contents
- [Problem Statement](#problem-statement)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Features Built](#features-built)
- [AI Integration](#ai-integration)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Team](#team)
- [Known Bugs & Limitations](#known-bugs--limitations)

---

## 🎯 Problem Statement

**#26ENMT5 — MediTrack: Smart Healthcare Management System**

Build a complete healthcare web application connecting patients, doctors, and hospital admins — with appointment booking, health record management, AI symptom analysis, and telemedicine features.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://meditrack-frontend.vercel.app *(deploy to Vercel)* |
| **Backend API** | https://meditrack-api.render.com *(deploy to Render)* |
| **API Health** | https://meditrack-api.render.com/api/health |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🧑‍⚕️ Patient | patient@meditrack.com | password |
| 👨‍⚕️ Doctor | doctor@meditrack.com | password |
| 🛡️ Admin | admin@meditrack.com | password |

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Create React App) |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Fonts | Google Fonts (Outfit, Instrument Serif, Space Mono) |
| Video Calls | Jitsi Meet (embedded iframe — free, no API key needed) |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express.js |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Rate Limiting | express-rate-limit |
| Security | Helmet.js |
| Payments | Razorpay Sandbox (simulated) |
| Data Store | In-memory (prototype) · MongoDB (production-ready) |

### Third-Party APIs
- **Anthropic Claude API** — Symptom analysis, health tips, doctor recommendations
- **Jitsi Meet** — Free, open-source HD video consultations
- **Razorpay Sandbox** — Payment simulation

---

## ✅ Features Built

### 👤 Three User Roles

**Patient**
- [x] Register / Login with JWT authentication
- [x] Search doctors by specialisation, location, rating, availability
- [x] Book in-person or video appointments with slot selection
- [x] AI Symptom Checker with urgency assessment
- [x] View past prescriptions and appointment history
- [x] Medication reminder setup with time and frequency
- [x] Sandbox payment for consultation fees
- [x] Billing history page
- [x] AI-personalized health tips on dashboard

**Doctor**
- [x] Register (pending admin approval) / Login
- [x] Dashboard with today's patient queue
- [x] Set availability (days + time slots + online/offline toggle)
- [x] Confirm or reject appointment requests
- [x] Write digital prescriptions (medicine, dosage, duration, timing, notes)
- [x] Join Jitsi Meet video consultation rooms
- [x] View earnings history
- [x] Mark appointments as completed upon prescription

**Admin**
- [x] Approve or reject doctor registrations with credential review
- [x] Dashboard: total patients, active doctors, revenue, appointments today
- [x] View all registered users (patients + doctors)
- [x] Remove users from the platform
- [x] See all available specialisations

### 🤖 AI Features (Claude API)

| Feature | Description |
|---------|-------------|
| **Symptom Checker** | Patient describes symptoms → AI returns possible conditions with likelihood, urgency level (Immediate/Urgent/Non-urgent/Monitor), urgency color coding, general advice, and recommended specialists |
| **Doctor Recommendations** | AI analyzes symptoms and recommends the top 3 most suitable doctors from the platform database |
| **Personalized Health Tips** | Dashboard shows 4 AI-generated health tips (Nutrition, Exercise, Sleep, Mental Health, Preventive Care) + a weekly goal + motivational message, personalized to the user |

### 💳 Payments
- [x] Sandbox payment flow via Razorpay (no real money)
- [x] Order initiation + confirmation simulation
- [x] Billing history for patients
- [x] Earnings dashboard for doctors

### 🎥 Video Consultation
- [x] Jitsi Meet embedded iframe (free, no account needed)
- [x] Doctor initiates room → room ID derived from appointment ID
- [x] Patient joins from their Appointments page
- [x] No external app installation required

---

## 🤖 AI Integration Details

The AI is powered by **Anthropic's Claude claude-sonnet-4-20250514** and accessed via the standard `/v1/messages` API.

```
POST /api/ai/symptom-check    → Symptom analysis with urgency
POST /api/ai/health-tips      → Personalized health tips
POST /api/ai/recommend-doctors → Smart doctor matching
```

All AI endpoints have **graceful fallback responses** — if the API key is not configured, the system returns realistic demo data so the UI still works completely.

**How prompts are structured:**
- System prompts enforce strict JSON output format for reliable parsing
- Medical disclaimers are baked into every health-related prompt
- Doctor recommendation AI is given the live doctor list from the database

---

## 🚀 Running Locally

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- (Optional) Anthropic API key for live AI features

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/meditrack.git
cd meditrack
```

### 2. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (optional but recommended)
npm start
# Backend runs on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
# The frontend is pre-configured to proxy to localhost:5000
npm start
# Frontend runs on http://localhost:3000
```

### 4. Test with Demo Accounts

Open http://localhost:3000 and use any of the demo credentials listed above.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# AI (get from https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...

# JWT
JWT_SECRET=your_super_secret_key

# Optional: MongoDB for production
MONGODB_URI=mongodb://localhost:27017/meditrack

# Optional: Razorpay keys (sandbox)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
# For production:
# REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 📁 Project Structure

```
meditrack/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT auth + role-based access
│   ├── routes/
│   │   ├── auth.js              # Register, Login, Profile
│   │   ├── doctors.js           # Doctor search, availability
│   │   ├── appointments.js      # Booking, status management
│   │   ├── ai.js                # Symptom check, health tips, recommendations
│   │   ├── admin.js             # Admin panel, approvals
│   │   ├── payments.js          # Sandbox payment flow
│   │   └── prescriptions.js     # Digital prescriptions + reminders
│   ├── server.js                # Express app, in-memory DB, routes
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   └── Navbar.js        # Role-aware navigation
        ├── contexts/
        │   └── AuthContext.js   # Global auth state
        ├── pages/
        │   ├── LandingPage.js   # Marketing hero page
        │   ├── AuthPage.js      # Login + Register
        │   ├── PatientDashboard.js
        │   ├── DoctorDashboard.js
        │   ├── AdminDashboard.js
        │   ├── FindDoctors.js   # Search + AI recommendations
        │   ├── DoctorProfile.js # Profile + booking flow
        │   ├── SymptomChecker.js # AI symptom analysis
        │   ├── Appointments.js
        │   ├── Prescriptions.js  # + medication reminders
        │   └── PaymentHistory.js
        ├── utils/
        │   └── api.js           # Axios API layer
        ├── App.js               # Routing + layout
        ├── index.css            # Design system (CSS variables, animations)
        └── index.js
```

---

## 🚀 Deployment Guide

### Backend → Render (Free Tier)
1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect your repo, set root directory to `backend/`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables in Render dashboard

### Frontend → Vercel
1. Create new project on [vercel.com](https://vercel.com)
2. Import your GitHub repo, set root to `frontend/`
3. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

---

## 👥 Team

| Name | Role |
|------|------|
| [Your Name] | Full Stack Lead |
| [Teammate 2] | Frontend / UI Design |
| [Teammate 3] | Backend / AI Integration |
| [Teammate 4] | DevOps / Deployment |

---

## ⚠️ Known Bugs & Limitations

We believe in transparency, so here's what we know:

1. **In-memory storage** — All data resets when the server restarts. In production, replace with MongoDB using the Mongoose models pattern shown in the codebase.

2. **No OTP-based password reset** — The forgot password flow shows a UI but does not send actual emails in the prototype (requires SMTP configuration).

3. **Razorpay integration is simulated** — The payment flow shows realistic UX and API calls, but no actual Razorpay SDK is loaded. It simulates a 1.5-second payment processing delay.

4. **Doctor ratings are static** — Doctor ratings are seeded and not dynamically updated from patient reviews (review submission UI not included in this prototype).

5. **No real push notifications** — Medication reminders are stored in the DB and shown on the dashboard, but no actual push/SMS notifications are sent.

6. **Jitsi room sharing** — In production, the room ID would be sent to the patient via email/notification. Currently the patient must know the room ID format (`meditrack-{first 8 chars of appointment ID}`).

7. **AI response time** — Anthropic API calls can take 3-8 seconds. The UI shows a loading animation during this time.

8. **No file upload for lab reports** — The doctor dashboard mentions uploading lab reports, but file upload to cloud storage (Cloudinary) is not implemented in this prototype.

---

*Built with ❤️ for DevFusion Hackathon 2026*
