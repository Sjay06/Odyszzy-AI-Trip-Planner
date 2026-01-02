# 🌍 Odyszzy – AI-Powered Trip Planner

**Odyszzy** is a full-stack web application that leverages multiple **Google Gemini AI agents**, orchestrated together to create **comprehensive, budget-optimized travel plans**.

Users input destination, dates, budget preferences, and nationality to receive **end-to-end itineraries** including:
- ✈️ Flights (real Amadeus API data)
- 🏨 Hotels
- 🎯 Activities
- 🛂 Visa requirements
- 🎒 Packing lists
- 🌦️ Weather forecasts
- 🏙️ City reviews scraped from travel blogs  

All searches are saved per user for history review.

---

## ✨ Key Features

- **5+ Specialized AI Agents**  
  Flights, hotels, budgets, visas, packing, weather, reviews, and more.

- **Real-Time Flight Search**  
  Amadeus API integration with baggage rules for 100+ airlines.

- **Multi-Budget Modes**  
  Quick plans, total budget optimization, daily spending limits.

- **Personal Search History**  
  Expandable cards showing all past searches with full AI outputs.

- **Secure Authentication**  
  Firebase Auth + MongoDB persistence.

- **Responsive Dark UI**  
  Tailwind-inspired CSS with gradients and animations.

---

## 🧱 Tech Stack

### Frontend
- React 18
- React Router
- Firebase Auth / Firestore
- Custom CSS (~26k lines)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Google Gemini 1.5 (Flash / Pro)
- Amadeus API
- SerpApi

### Deployment
- Frontend: Vercel  
- Backend: Render / Railway

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (Free Tier)
- Firebase Project
- API Keys:
  - Google Gemini
  - Amadeus
  - SerpApi

---

## 🔧 Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev
```

Runs on: ```http://localhost:5000```

Required .env
```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_gemini_key
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
SERPAPI_KEY=your_serpapi_key
JWT_SECRET=your_secret
```

## 🎨 Frontend Setup
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs on: ```http://localhost:3000```

Update:

```REACT_APP_API_URL=http://localhost:5000/api```

### Firebase Config

Update ```frontend/src/firebase.js``` with your Firebase project credentials.

## 🏗️ Architecture Overview
### Frontend (React SPA)
- Firebase Auth → Backend userId

- API Client → /api/trips/*

- Pages match backend controllers

- History renders full JSON responses in expandable cards

### Backend (Node/Express)

- 12 Gemini-powered agents

- Central TravelAgentOrchestrator

- tripController.js (13 endpoints)

- Utilities: Gemini clients, scrapers, cost estimators

- MongoDB models: Trip, QuickTrip, VisaQuery, etc.

## 🧠 Core Functionalities
### 1. User Authentication & Profile

- Pages: Login.jsx, Signup.jsx, ForgotPassword.jsx, ChangePassword.jsx

- Firebase Auth with backend-linked history

- Profile dropdown with history & password change

### 2. Quick Trip Planner

- Frontend: PlanTrip.jsx

- Backend: /api/trips/planTrip

- Instant day-wise itinerary with hotels & activities

### 3. Budget Optimizer

- Frontend: BudgetPlan.jsx

- Backend: /api/trips/planWithBudget

- Budget fitting, before/after costs, feasibility warnings

### 4. Comprehensive Travel Plan ⭐

- Frontend: ComprehensivePlan.jsx

- Backend: /api/trips/comprehensivePlan

- 10-agent orchestration:

  - Flights

  - Itinerary

  - Budget

  - Visa

  - Packing

  - Weather

  - Final summary

### 5. Daily Budget Planner

- Frontend: TravelOnMyBudget.jsx

- Backend: /api/trips/travelOnMyBudget

### 6. Real Flights + Baggage

- Frontend: Flights.jsx

- Backend: /api/trips/getRealFlightOptions

- 20+ live flight options

- Airline logos, baggage rules, stops & duration

### 7. Visa Checker

- Frontend: VisaChecker.jsx

- Backend: /api/trips/getVisaInfo

- Visa requirements by nationality

### 8. Packing List

- Frontend: PackingList.jsx

- Backend: /api/trips/getPackingList

- Weather-aware categorized packing lists

### 9. Weather Forecast

- Backend: WeatherAgent.js

- 16-day forecasts influencing packing & itineraries

### 10. City Reviews

- Backend: reviewScraper.js + ReviewInsightsAgent.js

- Scrapes 4 travel blogs

- AI summary of loves, complaints & tips

### 11. Search History ⭐

- Frontend: SearchHistory.jsx

- Backend: /api/trips/getSearchHistory

- 9 expandable card types

- Full JSON responses rendered (44k+ chars logic)

## 🔁 Agent Workflow

User Input → TravelAgentOrchestrator

Flights (Amadeus + Gemini)

Places & Itinerary

Budget Optimization

Visa, Packing, Weather

Cost Totals & Final Summary

## 🛠️ Development
### Backend tests
```npm test```

### Frontend lint
```npm run lint```

### Build
```
npm run build:backend
npm run build:frontend
```

## 🚀 Production Deployment
### Backend

- Render / Railway

- MongoDB Atlas

- Environment variables configured

### Frontend

- Vercel / Netlify

- Update REACT_APP_API_URL

### Firebase Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```


## 📄 License

MIT — Free for commercial use.