import mongoose from "mongoose";

const QuickTripSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true },
    itinerary: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quick_trips" }
);

const QuickTrip = mongoose.model("QuickTrip", QuickTripSchema);
export default QuickTrip;
