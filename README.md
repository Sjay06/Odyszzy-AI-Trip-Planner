Odyssey - AI-Powered Trip Planner

Odyssey is a full-stack web application that leverages multiple Google Gemini AI agents orchestrated together to create comprehensive, budget-optimized travel plans. Users input destination, dates, budget preferences, and nationality to receive end-to-end itineraries including flights (real Amadeus API data), hotels, activities, visa requirements, packing lists, weather forecasts, and city reviews scraped from travel blogs. All searches are saved per user for history review.

Key Features:

10+ Specialized AI Agents: Flights, hotels, budgets, visas, packing, weather, reviews, etc.

Real-Time Flight Search: Amadeus API integration with baggage rules for 100+ airlines.

Multi-Budget Modes: Quick plans, total budget optimization, daily spending limits.

Personal History: Expandable cards showing all past searches with full AI outputs.

Firebase Auth + MongoDB: Secure user sessions and persistent data.

Responsive Dark UI: Tailwind-inspired CSS with gradients, animations.

Tech Stack:

text
Frontend: React 18 + React Router + Firebase Auth/Firestore + Custom CSS (26k lines)
Backend: Node.js/Express + Mongoose/MongoDB + Google Gemini 1.5 (Flash/Pro) + Amadeus/SerpApi
Deployment: Ready for Vercel (frontend) + Render/Railway (backend)

🚀 Quick Start
Prerequisites

Node.js 18+

MongoDB Atlas account (free tier)

Firebase project (free tier)

API Keys: Google Gemini, Amadeus, SerpApi

Backend Setup

bash
cd backend
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev  # Runs on http://localhost:5000
.env required:

text
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_gemini_key
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
SERPAPI_KEY=your_serpapi_key
JWT_SECRET=your_secret
Frontend Setup

bash
cd frontend
cp .env.example .env
# Update REACT_APP_API_URL=http://localhost:5000/api
npm install
npm run dev  # http://localhost:3000
Firebase Config (frontend/src/firebase.js): Update with your project credentials.

🏗️ Architecture Overview
text
Frontend (React SPA)
├── Auth: Firebase → Backend userId
├── API Client → Backend /api/trips endpoints
├── Pages: Match backend controllers exactly
└── History: Renders full JSON responses in cards

Backend (Node/Express)
├── Agents (Gemini-powered): 12 specialized classes
├── Orchestrator: Coordinates agent sequence
├── Controllers: tripController.js (13 endpoints)
├── Utils: Gemini clients, cost estimators, scrapers
└── Models: Trip, QuickTrip, VisaQuery, etc. → MongoDB
![Project Structure]
​

✨ Core Functionalities
1. User Authentication & Profile

Pages: Login.jsx, Signup.jsx, ForgotPassword.jsx, ChangePassword.jsx

Users sign up/login with Firebase Auth. Backend stores userId for history. Navbar shows profile dropdown with "Search History" and "Change Password".


​

2. Quick Trip Planner (PlanTrip.jsx)

Backend: /api/trips/planTrip → ItineraryAgent.js

Enter destination + days → Instant AI-generated day-wise itinerary with 2-3 hotels, 3-5 daily activities, transport km estimate.


​

3. Budget Optimiser (BudgetPlan.jsx)

Backend: /api/trips/planWithBudget → BudgetAgent.js + costEstimator.js

Same as Quick Trip but optimizes against total budget. Shows before/after costs, warnings for impossible fits.


​

4. Comprehensive Travel Plan (ComprehensivePlan.jsx)

Backend: /api/trips/comprehensivePlan → TravelAgentOrchestrator.js (10 agents)

Full orchestration: Flights (Amadeus), places, budget, itinerary, visa, packing, costs. Includes summary, must-sees, tips.

​

5. Daily Budget Planner (TravelOnMyBudget.jsx)

Backend: /api/trips/travelOnMyBudget → DynamicBudgetAgent.js

​

6. Real Flights + Baggage (Flights.jsx)

Backend: /api/trips/getRealFlightOptions → FlightSearchAgent.js (Amadeus)

Live search with 20+ options, airline logos, baggage (carry-on/checked/extra per 100+ airlines), duration/stops/pricing.

​

7. Visa Checker (VisaChecker.jsx)

Backend: /api/trips/getVisaInfo → VisaAgent.js

Nationality + destination → Requirements, fees, docs, processing time.

​

8. Packing List (PackingList.jsx)

Backend: /api/trips/getPackingList → PackingListAgent.js

Dates + trip type → Categorized list (essentials, clothing, electronics) + weather-aware.

​

9. Weather Forecast (Weather.jsx)

Backend: WeatherAgent.js + weatherController.js

16-day forecasts per city. Influences packing/itineraries.


10. City Reviews (CityReviews.jsx)

Backend: reviewScraper.js (SerpApi) + ReviewInsightsAgent.js

Scrapes 4 travel blogs → AI summary: loves/complaints/highlights/warnings/tips.

​

11. Search History (SearchHistory.jsx) ⭐

Backend: /api/trips/getSearchHistory → All models queried

Ultimate feature: 9 card types (QuickTrips, Comprehensive, Flights, etc.). Expandable rows show full JSON: itineraries, costs, flights, visas exactly as generated. 44k chars of rendering logic.

​

🛠️ Agent Workflow
![Workflow Diagram]
​

User inputs → TravelAgentOrchestrator coordinates:

Flights (Amadeus/Gemini)

Places/Itinerary (Gemini JSON)

Budget optimization

Visa/Packing/Weather

Cost totals + summary

🔧 Development
bash
# Backend tests
npm test

# Frontend lint
npm run lint

# Build both
npm run build:backend && npm run build:frontend
📱 Screenshots Gallery
Home/Workflow
​
Comprehensive Plan
​
Flights Table
​
History
​
Auth
​

🚀 Production Deployment
Backend: Railway/Render → MongoDB Atlas + env vars

Frontend: Vercel/Netlify → Update API_URL

Firebase: Enable Auth + Firestore rules:

javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
🤝 Contributing
Fork → Branch (feature/agentX)

Backend: Add agent → Update orchestrator/controller

Frontend: New page → apiClient wrapper → App.jsx route

Tests → PR

📄 License
MIT - Free for commercial use.

🙌 Acknowledgments
Google Gemini API (core intelligence)

Amadeus (flights)

SerpApi (reviews)

Firebase (auth)