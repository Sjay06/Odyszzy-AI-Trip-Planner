import { callGeminiJSON } from "../utils/geminiClient.js";

/**
 * Flight Agent using Gemini
 */
export default async function flightAgent(destination, origin = "Mumbai") {
  const systemInstruction =
    "You are a flight booking expert with knowledge of airline pricing and routes. " +
    "Provide realistic Indian Rupee prices, but do not call external APIs.";

  const prompt = `
You are a Travel Flight Information AI Agent specialized in flight pricing and options.

ORIGIN: ${origin}
DESTINATION: ${destination}

Return JSON ONLY with this exact structure:

{
  "origin": "string",
  "destination": "string",
  "averagePrice": 0,
  "flightOptions": [
    {
      "airline": "Indigo",
      "price": 0,
      "duration": "2h 30m",
      "type": "budget | standard | premium",
      "departureTime": "typical departure time"
    }
  ],
  "tips": [
    "Booking tip 1",
    "Booking tip 2"
  ],
  "routeType": "domestic | international",
  "bestBookingTime": "2-3 weeks in advance"
}

Rules:
- Use real Indian airline names (IndiGo, Air India, Vistara, SpiceJet, etc.).
- Prices must be realistic for the route in INR.
- Only output valid JSON, no explanations.
`;

  const result = await callGeminiJSON(prompt, systemInstruction);

  if (!Array.isArray(result.flightOptions)) {
    throw new Error("Invalid response format from FlightAgent (Gemini)");
  }

  return {
    origin: result.origin || origin,
    destination: result.destination || destination,
    averagePrice: result.averagePrice || 0,
    flightOptions: result.flightOptions,
    tips: result.tips || [],
    routeType: result.routeType || "domestic",
    bestBookingTime: result.bestBookingTime || "2-3 weeks in advance"
  };
}
