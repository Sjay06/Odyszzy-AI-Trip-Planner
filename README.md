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
- Open Meteo API

### Deployment
- Frontend: Vercel  
- Backend: Vercel

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
  - Open Meteo

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

- 9 AI-powered agents

- Central TravelAgentOrchestrator

- tripController.js (13 endpoints)

- Utilities: Gemini clients, scrapers, cost estimators

- MongoDB models: Trip, QuickTrip, VisaQuery, etc.

## 🧠 Core Functionalities
### 1. User Authentication & Profile

- Pages: Login.jsx, Signup.jsx, ForgotPassword.jsx, ChangePassword.jsx

- Firebase Auth with backend-linked history

- Profile dropdown with history & password change

- <img width="1241" height="652" alt="image" src="https://github.com/user-attachments/assets/09bda588-f3b3-47da-9fe6-8536aa7bb2fc" />

- <img width="1189" height="681" alt="image" src="https://github.com/user-attachments/assets/0d390819-f7b0-4c1e-9b27-c1285d1ff5a9" />

- <img width="1223" height="690" alt="image" src="https://github.com/user-attachments/assets/477e3ecc-3bba-4e4a-9e27-a913e4e53a6d" />

- <img width="1219" height="705" alt="image" src="https://github.com/user-attachments/assets/4d389da5-9f19-443e-bb44-9afa2f539efc" />

- <img width="1189" height="706" alt="image" src="https://github.com/user-attachments/assets/ccd2c7f9-d3df-4e6a-b7ad-62aa258e0e9a" />

- <img width="1225" height="711" alt="image" src="https://github.com/user-attachments/assets/f3d6bd76-e93f-4147-938a-2f4da0239ee7" />


### 2. Quick Trip Planner

- Instant day-wise itinerary with hotels & activities

- https://github.com/user-attachments/assets/46a9adcb-cbd6-42f9-a8b3-1ef3c0bb3bb5

### 3. Budget Optimizer

- Budget fitting, before/after costs, feasibility warnings

- https://github.com/user-attachments/assets/b251f0a9-0e09-4d0d-8239-a7db0024f85f


### 4. Comprehensive Travel Plan ⭐

- 9 agent orchestration:

  - Flights

  - Itinerary

  - Budget

  - Visa

  - Packing

  - Weather

- https://github.com/user-attachments/assets/4f1cc262-b8b9-49b5-b12b-40da787dadf3


### 5. Daily Budget Planner

- https://github.com/user-attachments/assets/918ad8d2-c1d2-417a-8822-47c98c475adf

### 6. Real Flights + Baggage

- 20+ live flight options

- Airline logos, baggage rules, stops & duration

- <img width="1222" height="713" alt="image" src="https://github.com/user-attachments/assets/eb7f9910-7851-48f7-a92f-d14d02df97a2" />

- <img width="1223" height="702" alt="image" src="https://github.com/user-attachments/assets/c86ab639-4793-40f8-8807-dc2486d11756" />

### 7. Visa Checker

- Visa requirements by nationality

- https://github.com/user-attachments/assets/cee1099e-f59a-4706-a34f-94919199d12f

### 8. Packing List

- Weather-aware categorized packing lists

- https://github.com/user-attachments/assets/2c03cfca-c5a3-43a9-9def-b9d4747938ae

### 9. Weather Forecast

- Backend: WeatherAgent.js

- 16-day forecasts influencing packing & itineraries

- https://github.com/user-attachments/assets/62e15dd4-8343-4f57-8d02-d8cb4caf1fe7

### 10. City Reviews

- Backend: reviewScraper.js + ReviewInsightsAgent.js

- Scrapes 4 travel blogs

- AI summary of loves, complaints & tips

- https://github.com/user-attachments/assets/812a6716-0c6e-452b-a31f-0148713bd436

### 11. Search History ⭐

- 9 expandable card types

- Full JSON responses rendered (44k+ chars logic)

- <img width="1192" height="681" alt="image" src="https://github.com/user-attachments/assets/da8f6cf8-a62b-4d29-9fd9-5e81ba6382c1" />

- <img width="1192" height="681" alt="image" src="https://github.com/user-attachments/assets/c0cabc83-6566-4ab3-a637-d3a8c9bedc6b" />

## 🔁 Agent Workflow

User Input 

Flights 

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

- Vercel

- MongoDB Atlas

- Environment variables configured

### Frontend

- Vercel

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