import React from "react";
import { Link } from "react-router-dom";

const FeatureCard = ({ title, description, to }) => {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={to} className="feature-link">
        Explore
      </Link>
    </div>
  );
};

export default FeatureCard;
