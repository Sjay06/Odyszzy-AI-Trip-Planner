import React, { useState } from "react";

const Footer = () => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can later POST this to backend
    setSubmitted(true);
    setFeedback("");
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>ODYSZZY - Vivre Le Monde!</h3>
          <p>
            AI-powered multi-agent travel planning engine that turns your
            preferences into end-to-end itineraries.
          </p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: support@odyszzy.in</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: Chennai, India</p>
        </div>
        <div>
          <h4>Feedback</h4>
          {submitted && <p className="feedback-success">Thanks for your feedback!</p>}
          <form onSubmit={handleSubmit} className="feedback-form">
            <input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              placeholder="Share your experience or suggestions..."
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <button type="submit">Submit Feedback</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Autonomous Travel AI. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
