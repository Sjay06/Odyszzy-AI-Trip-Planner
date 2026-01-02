import mongoose from "mongoose";

const CityReviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // Firebase UID
  },
  city: {
    type: String,
    required: true,
  },
  insights: {
    type: mongoose.Schema.Types.Mixed, // { summary, love[], complaints[], tips[] } from ReviewInsightsAgent
    required: true,
  },
  // ReviewInsightsAgent result
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "city_reviews"
});

const CityReview = mongoose.model("CityReview", CityReviewSchema);
export default CityReview;
