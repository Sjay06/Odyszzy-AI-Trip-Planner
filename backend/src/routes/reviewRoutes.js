import express from "express";
import { ReviewInsightsAgent } from "../agents/ReviewInsightsAgent.js";
import CityReview from "../models/CityReview.js"; // NEW IMPORT

const router = express.Router();
const agent = new ReviewInsightsAgent();

router.get("/city-reviews", async (req, res) => {
  const { city, userId } = req.query;
  console.log("[/city-reviews] query city =", city);

  if (!city || !userId) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const insights = await agent.run(city);
    
    // NEW: Persist to MongoDB (non-blocking, like other controllers)
    let reviewId = null;
    try {
      const doc = await CityReview.create({
        userId,
        city,
        insights,
      });
      reviewId = doc._id;
      console.log(`[CityReview] Saved reviewId: ${reviewId} for city: ${city}`);
    } catch (dbError) {
      console.error("[CityReview] Database save error (non-critical):", dbError.message);
    }

    console.log("[/city-reviews] success");
    res.json({ 
      success: true,
      insights,
      reviewId // NEW: Return ID like other endpoints
    });
  } catch (err) {
    console.error("[/city-reviews] error:", err);
    res.status(500).json({
      error: "Unable to fetch recent city reviews at the moment. Please try again later."
    });
  }
});

export default router;
