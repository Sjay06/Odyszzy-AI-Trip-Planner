// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import OdyszzyLogo from "../assets/Odyszzy.png";   // <-- add this line

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username =
    user?.email || localStorage.getItem("username") || "User";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const goToHistory = () => {
    navigate("/search-history");
    setOpen(false);
  };

  const goToChangePassword = () => {
    navigate("/change-password");
    setOpen(false);
  };

  return (
    <header className="navbar">
      {/* Replace text brand with logo */}
      <div className="navbar-logo">
        <img
          src={OdyszzyLogo}
          alt="Odyszzy logo"
          className="navbar-logo-img"
        />
      </div>

      <nav className="navbar-links">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/plan-trip">Quick Trip Planner</NavLink>
        <NavLink to="/budget-plan">Budget Optimiser</NavLink>
        <NavLink to="/comprehensive">Comprehensive Travel Plan</NavLink>
        <NavLink to="/travel-on-my-budget">Daily Budget</NavLink>
        <NavLink to="/visa-checker">Visa Checker</NavLink>
        <NavLink to="/packing-list">Packing List Considerations</NavLink>
        <NavLink to="/flights">Flights &amp; Baggage</NavLink>
        <NavLink to="/weather">Weather Checker</NavLink>
        <NavLink to="/city-reviews">City Reviews</NavLink>

        <div className="profile-wrapper">
          <button
            type="button"
            className="profile-button"
            onClick={() => setOpen(!open)}
          >
            Profile
          </button>

          {open && (
            <div className="profile-menu">
              <div className="profile-item profile-username">
                {username}
              </div>
              <button
                type="button"
                className="profile-item"
                onClick={goToChangePassword}
              >
                Change password
              </button>
              <button
                type="button"
                className="profile-item"
                onClick={goToHistory}
              >
                Search History
              </button>
              <button
                type="button"
                className="profile-item profile-logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
