import mongoose from "mongoose";

const WeatherLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    city: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    weather: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "weather_log" }
);

const WeatherLog = mongoose.model("WeatherLog", WeatherLogSchema);
export default WeatherLog;
