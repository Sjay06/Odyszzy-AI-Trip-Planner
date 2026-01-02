// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase";

const ChangePassword = () => {
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic front‑end validation
    if (!existingPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      // Adjust length rule if you have a stricter policy
      setError("New password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        setError("You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      // 1. Re‑authenticate with existing password
      const credential = EmailAuthProvider.credential(
        user.email,
        existingPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 2. Update password to the new one
      await updatePassword(user, newPassword);

      setSuccess("Password changed successfully.");
      setExistingPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      // Handle common Firebase auth error codes
      if (err.code === "auth/wrong-password") {
        setError("Existing password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setError("New password is too weak.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log in again and then try changing your password.");
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Change password</h1>
        <p>Update your account password securely.</p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Existing password
              <input
                type="password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Changing..." : "Submit"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </section>
    </main>
  );
};

export default ChangePassword;
