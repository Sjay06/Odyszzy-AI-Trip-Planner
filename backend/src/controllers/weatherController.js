// backend/src/controllers/weatherController.js
import weatherAgent from "../agents/WeatherAgent.js";
import WeatherLog from "../models/WeatherLog.js";

export async function getWeather(req, res) {
  try {
    const { city, date, userId } = req.query; // ?city=Copenhagen&date=2025-12-24

    if (!city || !date || !userId) {
      return res
        .status(400)
        .json({ error: "city and date (YYYY-MM-DD) are required" });
    }

    const weather = await weatherAgent(city, date);

    const doc = await WeatherLog.create({
      userId,
      city,
      date,
      weather,
    });

    res.json({ weather, queryId: doc._id });
  } catch (err) {
    console.error("Error in getWeather:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch weather data" });
  }
}
