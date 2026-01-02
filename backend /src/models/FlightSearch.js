import mongoose from "mongoose";

const FlightSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    result: { type: mongoose.Schema.Types.Mixed, required: true }, // flightSearchAgent output
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "flight_searches" }
);

const FlightSearch = mongoose.model("FlightSearch", FlightSearchSchema);
export default FlightSearch;
