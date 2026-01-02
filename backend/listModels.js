// listModels.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // loads backend/.env

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

async function listModels() {
  try {
    const url = "https://generativelanguage.googleapis.com/v1/models";
    const { data } = await axios.get(url, {
      headers: {
        "x-goog-api-key": GEMINI_KEY
      }
    });

    console.log("=== Available Gemini models for this key ===");
    for (const m of data.models || []) {
      console.log(
        "-",
        m.name,
        " | generation methods:",
        m.supportedGenerationMethods?.join(", ") || "none"
      );
    }
  } catch (err) {
    console.error("ListModels error:", err.response?.data || err.message);
  }
}

listModels();
