import mongoose from "mongoose";

const PackingQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    destination: { type: String, required: true },
    startDate: { type: String, required: true }, // or Date if you prefer
    endDate: { type: String, required: true },
    tripType: { type: String },
    preferences: { type: String },
    packingList: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "packing_queries" }
);

const PackingQuery = mongoose.model("PackingQuery", PackingQuerySchema);
export default PackingQuery;
