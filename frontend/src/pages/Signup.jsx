// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "../firebase";

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: ""
  });
  const [step, setStep] = useState(1); // 1: details, 2: verification notice
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await sendEmailVerification(userCred.user);

      // here you could also POST the profile fields to your backend if you want to store them
      setStep(2);
      setInfo("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {step === 1 ? (
          <>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Start using Autonomous Travel AI in a few seconds.
            </p>

            <form className="auth-form" onSubmit={handleSignup}>
              <div className="auth-row">
                <label>
                  First name
                  <input
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Last name
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                Date of birth
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                />
              </label>

              <div className="auth-row">
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Confirm password
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>

              {error && <p className="auth-error">{error}</p>}
              {info && <p className="auth-message">{info}</p>}
            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              A verification link has been sent to{" "}
              <strong>{form.email}</strong>. Please click it, then continue.
            </p>

            <button
              className="primary-btn"
              onClick={handleGoToLogin}
            >
              Go to Login
            </button>

            {info && <p className="auth-message">{info}</p>}
            {error && <p className="auth-error">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
};

export default Signup;
