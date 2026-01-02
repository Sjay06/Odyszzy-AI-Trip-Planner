// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, signInWithEmailAndPassword } from "../firebase";
import OdyszzyLogo from "../assets/Odyszzy.png";  // Import logo

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, emailOrUsername, password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Header with Logo + App Name */}
      <div className="auth-header">
        <img src={OdyszzyLogo} alt="Odyszzy" className="auth-logo" />
      </div>

      {/* Login Card */}
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue planning your trip.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username / Email
            <input
              type="email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="auth-links-row">
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <p className="auth-footer">
          New user?{" "}
          <Link to="/signup" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
