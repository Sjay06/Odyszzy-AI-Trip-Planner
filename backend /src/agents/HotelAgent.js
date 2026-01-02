import { callGeminiJSON } from "../utils/geminiClient.js";

/**
 * Hotel Agent using Gemini
 */
export default async function hotelAgent(destination, budget = null) {
  const systemInstruction =
    "You are a travel accommodation expert with knowledge of hotel prices and amenities worldwide. " +
    "Always return valid JSON only and prices in INR.";

  const budgetText = budget
    ? `Try to respect a per-night budget around ${budget} INR when possible.`
    : "No strict per-night budget.";

  const prompt = `
DESTINATION: ${destination}
${budgetText}

Return JSON ONLY with this exact structure:

{
  "hotels": [
    {
      "name": "Hotel name realistic for ${destination}",
      "pricePerNight": 0,
      "rating": 0.0,
      "amenities": ["Free WiFi", "Breakfast included"],
      "location": "Specific location description",
      "type": "budget | mid-range | luxury",
      "description": "Brief description of the hotel"
    }
  ]
}

Rules:
- Include 3-5 hotels across budget, mid-range, and luxury.
- Prices realistic for ${destination} in INR.
`;

  const result = await callGeminiJSON(prompt, systemInstruction);

  if (!Array.isArray(result.hotels)) {
    throw new Error("Invalid response format from HotelAgent (Gemini)");
  }

  return result.hotels;
}
