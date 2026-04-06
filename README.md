# 🦁 Wildlife Rescue — AI-Based Platform for Monitoring Wildlife Conservation Efforts

> A full-stack web platform that leverages Artificial Intelligence to streamline wildlife incident reporting, rescue coordination, and conservation analytics.

[![Node.js](https://img.shields.io/badge/Node.js-v24-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.13-yellow?logo=python)](https://python.org)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange?logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [ML Models](#ml-models)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Team](#team)

---

## 🌿 Overview

**Wildlife Rescue** is an AI-powered, full-stack web application designed to connect animal lovers, rescue organizations, and conservationists. The platform allows citizens to report wildlife incidents in real time, enables rescue organizations to coordinate responses efficiently, and provides administrators with predictive insights into poaching risk, disease outbreaks, and conservation impact.

The system integrates:
- **Computer Vision** (Groq Llama-4 Vision) for species identification and injury assessment from photos
- **Machine Learning** (Random Forest + Logistic Regression) for incident priority classification and rescue success prediction
- **Predictive Analytics** for conservation insights, poaching risk forecasting, and demand planning

---

## ✨ Features

### 👤 For Animal Lovers
- 📍 **Report Wildlife Incidents** — Submit geo-tagged incident reports with photos, description, and animal details
- 🤖 **AI Species Identifier** — Upload a photo to instantly identify the animal species using Groq Vision AI
- 🏥 **AI Injury Assessor** — Assess the severity of an animal's condition from a photo before emergency help arrives
- 📊 **Track My Incidents** — Monitor the status of reported incidents in real time

### 🚑 For Rescue Organizations
- 🗂️ **Rescue Dashboard** — View all assigned incidents sorted by AI-predicted priority
- ✅ **Accept & Manage** — Accept incidents and update their status (in_progress, completed)
- 📈 **Organization Analytics** — View response metrics and success rates

### 🛡️ For Administrators
- 🌍 **Conservation Dashboard** — Track ecosystem health, rescue impact metrics, and biodiversity indicators
- 🔮 **Predictive Insights** — AI-powered poaching risk maps, disease outbreak forecasts, and rescue demand predictions
- 👥 **User & Organization Management** — Manage registrations and verification status

### 🤖 AI & ML Capabilities
| Feature | Technology | Description |
|---|---|---|
| Species Identification | **Groq Llama-4 Vision** | Identify animal species from uploaded photos |
| Injury Assessment | **Groq Llama-4 Vision** | Assess injury severity and provide first-aid recommendations |
| Priority Classification | **Random Forest** | Automatically classify incident urgency (low/medium/critical) |
| Rescue Success Prediction | **Logistic Regression** | Predict the probability of successful rescue |
| Poaching Risk | **Rule-Based ML** | Geographic + seasonal risk scoring |
| Disease Forecasting | **Statistical ML** | 30-day case outbreak predictions |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│              React 19 + Vite (localhost:5173)                │
│     ┌──────────┬──────────┬──────────┬──────────────────┐   │
│     │  Report  │ Rescuer  │  Admin   │  Conservation    │   │
│     │ Incident │Dashboard │ Dashboard│    & Insights    │   │
│     └────┬─────┴─────┬────┴────┬─────┴───────┬──────────┘   │
└──────────┼───────────┼─────────┼─────────────┼──────────────┘
           │ REST API  │         │             │ REST API
           ▼           ▼         ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                     NODE.JS BACKEND                          │
│              Express.js API Server (port 4000)               │
│   ┌────────┬──────────┬─────────┬──────────┬─────────────┐  │
│   │ /auth  │/incidents│/rescuer │  /admin  │/api/analytics│  │
│   └────────┴──────────┴─────────┴──────────┴─────────────┘  │
│              Sequelize ORM  │  JWT Auth  │  Passport.js       │
└──────────────────┬──────────────────────────────────────────┘
                   │                         │ REST API
                   ▼                         ▼
        ┌──────────────────┐    ┌─────────────────────────────┐
        │  MySQL Database   │    │    FLASK ML API (port 5000)  │
        │  (Sequelize ORM)  │    │                             │
        │  • Users          │    │  /api/ai/identify-species   │
        │  • Incidents      │    │  /api/ai/assess-injury      │
        │  • Organizations  │    │  /predict/priority          │
        │  • Rescuers       │    │  /predict/success           │
        │  • StatusHistory  │    │  /predict/combined          │
        └──────────────────┘    │  (Groq Vision + sklearn ML) │
                                └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite (Rolldown) | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Vanilla CSS | — | Styling (no UI library) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24.x | Runtime |
| Express.js | 4.x | REST API framework |
| Sequelize | 6.x | ORM for MySQL/SQLite |
| MySQL2 | 3.x | Database driver |
| JWT | 9.x | Authentication tokens |
| Passport.js | 0.7 | Google OAuth 2.0 |
| bcryptjs | 3.x | Password hashing |

### ML / AI Service
| Technology | Purpose |
|---|---|
| Python 3.13 | ML service runtime |
| Flask | REST API framework |
| scikit-learn | RandomForest & LogisticRegression models |
| Groq API (Llama-4 Scout Vision) | Species ID & injury assessment |
| joblib | Model serialization |
| pandas / numpy | Data processing |

### Database
| | |
|---|---|
| **Primary** | MySQL 8.x (production) |
| **Development** | SQLite (fallback) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- MySQL 8.x (or use SQLite for development)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Shanjai24/WildlifeRescue.git
cd WildlifeRescue
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
cd ml
pip install flask flask-cors scikit-learn joblib numpy pandas groq python-dotenv
cd ..
```

### 4. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
```

### 5. Start the Application

**Terminal 1 — Node backend + React frontend:**
```bash
npm run dev
```

**Terminal 2 — Flask ML API:**
```bash
cd ml
python app.py
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **ML API**: http://localhost:5000

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=4000

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Database (MySQL)
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=animalrescue

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# AI
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login with email/password |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `POST` | `/auth/logout` | Logout |

### Incidents
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/incidents` | Report a new incident | Animal Lover |
| `GET` | `/incidents` | Get my incidents | Animal Lover |
| `GET` | `/incidents/:id` | Get incident by ID | Any |

### Rescuer
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/rescuer/incidents` | Get assigned incidents | Rescuer |
| `POST` | `/rescuer/incidents/:id/accept` | Accept an incident | Rescuer |
| `PUT` | `/rescuer/incidents/:id/status` | Update incident status | Rescuer |

### AI / ML
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/identify-species` | Identify animal from image |
| `POST` | `/api/ai/assess-injury` | Assess injury from image |
| `POST` | `/predict/priority` | ML priority classification |
| `POST` | `/predict/success` | ML rescue success prediction |

### Analytics
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/analytics/conservation` | Conservation metrics | Admin |
| `GET` | `/api/analytics/poaching` | Poaching risk predictions | Admin |
| `GET` | `/api/analytics/disease` | Disease outbreak forecast | Admin |

---

## 🤖 ML Models

The ML models are stored in `ml/models/` and were trained on synthetic wildlife rescue data:

| Model | File | Algorithm | Purpose |
|---|---|---|---|
| Priority Classifier | `priority_classifier.joblib` | Random Forest | Classify incident priority |
| Success Predictor | `success_predictor.joblib` | Logistic Regression | Predict rescue success probability |
| Label Encoders | `label_encoders.joblib` | LabelEncoder | Encode categorical features |

### Training Features
**Priority Classification:**
- `animal_category`, `incident_type`, `time_of_day`, `location_type`, `weather`
- Text features: `has_bleeding`, `has_trapped`, `has_unconscious`, `near_highway`, `in_storm`

**Success Prediction:**
- `priority`, `animal_category`, `incident_type`, `org_type`
- `response_time_min`, `distance_km`, `weather`, `location_type`

---

## ☁️ Deployment

### Frontend → Vercel
```bash
npm run build
# Deploy the dist/ folder to Vercel
```
Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render
1. Connect GitHub repo to Render
2. **Build Command:** `npm install`
3. **Start Command:** `node index.js`
4. Add all `.env` variables in Render dashboard

### ML API → Render (Python)
1. Create a new Web Service on Render
2. **Root Directory:** `ml`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python app.py`

### Database → Render MySQL / PlanetScale
- Provision a MySQL database
- Update `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` accordingly

---

## 📁 Project Structure

```
WildlifeRescue/
├── index.js                  # Express app entry point
├── vite.config.js            # Vite + proxy configuration
├── package.json
├── .env                      # Environment variables
│
├── lib/
│   └── db.js                 # Sequelize models & DB config
│
├── middleware/
│   └── auth.js               # JWT auth & role middleware
│
├── routes/
│   ├── auth.js               # Auth routes (login, register, OAuth)
│   ├── incidents.js          # Incident CRUD routes
│   ├── rescuer.js            # Rescuer dashboard routes
│   └── admin.js              # Admin management routes
│
├── services/
│   └── ai.js                 # Priority classifier & org matching
│
├── ml/                       # Python Flask ML Service
│   ├── app.py                # Flask API with all ML endpoints
│   ├── requirements.txt
│   └── models/
│       ├── priority_classifier.joblib
│       ├── success_predictor.joblib
│       ├── label_encoders.joblib
│       └── metadata.json
│
└── src/                      # React Frontend
    ├── App.jsx               # Root component + routing
    ├── api/
    │   └── client.js         # Axios instance
    ├── components/
    │   ├── AI/
    │   │   ├── SpeciesIdentifier.jsx
    │   │   └── InjuryAssessor.jsx
    │   └── PriorityBadge.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── ReportIncident.jsx
        ├── IncidentStatus.jsx
        ├── RescuerDashboard.jsx
        ├── ConservationDashboard.jsx
        └── PredictiveInsights.jsx
```

---

## 👥 Team

**Project:** AI-Based Platform for Monitoring Wildlife Conservation Efforts  
**Institution:** [Your Institution Name]  
**Academic Year:** 2025–2026

| Name | Role |
|---|---|
| Shanjai | Full Stack Developer & ML Engineer |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>🌿 Built with ❤️ for Wildlife Conservation 🌿</strong>
</div>
