// e.g. backend/src/routes/weatherRoutes.js
import express from "express";
import { getWeather } from "../controllers/weatherController.js";

const router = express.Router();

router.post("/lookup", getWeather);

export default router;
