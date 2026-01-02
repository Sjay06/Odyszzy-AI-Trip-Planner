// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import BudgetPlan from "./pages/BudgetPlan";
import ComprehensivePlan from "./pages/ComprehensivePlan";
import TravelOnMyBudget from "./pages/TravelOnMyBudget";
import VisaChecker from "./pages/VisaChecker";
import PackingList from "./pages/PackingList";
import Flights from "./pages/Flights";
import Weather from "./pages/Weather.jsx";
import CityReviews from "./pages/CityReviews";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import SearchHistory from "./pages/SearchHistory";
import ChangePassword from "./pages/ChangePassword";
import "./styles.css";

import { auth, onAuthStateChanged } from "./firebase";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppInner = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const authRoutes = ["/", "/login", "/signup", "/forgot-password"];
  const hideNavbar = authRoutes.includes(location.pathname);

  if (checking) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar user={user}/>}

      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected app routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan-trip"
          element={
            <ProtectedRoute user={user}>
              <PlanTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget-plan"
          element={
            <ProtectedRoute user={user}>
              <BudgetPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comprehensive"
          element={
            <ProtectedRoute user={user}>
              <ComprehensivePlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel-on-my-budget"
          element={
            <ProtectedRoute user={user}>
              <TravelOnMyBudget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visa-checker"
          element={
            <ProtectedRoute user={user}>
              <VisaChecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packing-list"
          element={
            <ProtectedRoute user={user}>
              <PackingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights"
          element={
            <ProtectedRoute user={user}>
              <Flights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute user={user}>
              <Weather />
            </ProtectedRoute>
          }
        />
        <Route
          path="/city-reviews"
          element={
            <ProtectedRoute user={user}>
              <CityReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-history"
          element={
            <ProtectedRoute user={user}>
              <SearchHistory />
            </ProtectedRoute>
          }
        />

        {/* Change password should also be protected */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Footer />
    </div>
  );
};

const App = () => (
  <Router>
    <AppInner />
  </Router>
);

export default App;
