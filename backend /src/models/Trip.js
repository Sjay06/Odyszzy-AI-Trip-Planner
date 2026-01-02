import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    // Store whatever structure your agents return
    days: { type: Number, required: false },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: Number, required: false },

    // NEW: which feature created this trip
    // "BUDGET_OPTIMISER" | "DAILY_BUDGET" | "COMPREHENSIVE"
    type: { type: String, required: false },   // <--- added

    // Base itinerary from ItineraryAgent / Orchestrator
    baseItinerary: { type: mongoose.Schema.Types.Mixed },

    // Optimized itinerary from BudgetAgent / DynamicBudgetAgent
    optimizedItinerary: { type: mongoose.Schema.Types.Mixed },

    finalCost: { type: Number, required: false },

    warnings: [{ type: String }],

    // Optional metadata for analytics
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "trips",
  }
);

const Trip = mongoose.model("Trip", TripSchema);

export default Trip;
