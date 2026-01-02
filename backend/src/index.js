import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import tripRoutes from "./routes/tripRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";

// Fix .env path since index.js is in src
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("DEBUG GEMINI PREFIX:", (process.env.GEMINI_API_KEY || "").slice(0, 10));
console.log("DEBUG AMADEUS PREFIX:", (process.env.AMADEUS_CLIENT_ID || "").slice(0, 6));

const app = express();
app.use(express.json());
app.use(cors());

// Validate Gemini Key (Google AI Studio)
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing from .env file");
  process.exit(1);
}
console.log("Gemini Key: Loaded ✓");

// Routes
app.use("/api/trip", tripRoutes);
app.use("/api", reviewRoutes);
app.use("/api/weather", weatherRoutes);

// DB connect
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// Listen - Auto-find available port if default is in use
const DEFAULT_PORT = parseInt(process.env.PORT) || 5000;
const ALTERNATIVE_PORTS = [5001, 5002, 3000, 3001, 8000];
let portIndex = 0;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(
      `📡 API endpoints available at http://localhost:${port}/api/trip`
    );
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        `⚠️  Port ${port} is already in use, trying alternative port...`
      );

      // Try next alternative port
      if (portIndex < ALTERNATIVE_PORTS.length) {
        const nextPort = ALTERNATIVE_PORTS[portIndex];
        portIndex++;
        startServer(nextPort);
      } else {
        console.error(`\n❌ All common ports are in use!`);
        console.log(`\nTo fix this, you can:`);
        console.log(`1. Kill the process using port ${port}:`);
        console.log(`   lsof -ti:${port} | xargs kill -9`);
        console.log(`\n2. Or set a custom PORT in your .env file`);
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
