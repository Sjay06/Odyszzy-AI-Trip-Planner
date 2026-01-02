import { callGeminiJSON } from "../utils/geminiClient.js";

/**
 * PlacesAgent using Gemini
 * Input: destination, days
 * Output: { placesToVisit[], dayWisePlan[], cheapFacilities[] }
 */
export default async function placesAgent(destination, days) {
  const systemInstruction =
    "You are a travel places recommendation assistant. " +
    "Always return valid JSON only, no extra explanations.";

  const prompt = `
You are a Travel Places Recommendation AI Agent.

Destination: ${destination}
Number of days: ${days}

Return JSON ONLY with this exact structure:

{
  "placesToVisit": [
    {
      "name": "Place name",
      "category": "historical | museum | nature | adventure | food | cultural",
      "description": "Brief description",
      "visitDuration": "e.g., 2-3 hours",
      "bestTimeToVisit": "morning | afternoon | evening",
      "entryFee": 0,
      "priority": "must-see | recommended | optional"
    }
  ],
  "dayWisePlan": [
    {
      "day": 1,
      "places": ["Place 1", "Place 2"],
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "cheapFacilities": [
    {
      "name": "Facility name",
      "type": "restaurant | transport | accommodation",
      "description": "Why it's budget-friendly",
      "cost": 0
    }
  ]
}

Rules:
- Include at least 8-12 placesToVisit for a typical multi-day trip.
- Make dayWisePlan realistic: 2-4 main places per day depending on type.
- Use INR for any cost fields (entryFee, cost) and keep numbers realistic for ${destination}.
`;

  try {
    const result = await callGeminiJSON(prompt, systemInstruction);
    // const result = await callGeminiJSONGrounded(prompt);


    if (!result || typeof result !== "object") {
      throw new Error("Invalid response from PlacesAgent (Gemini)");
    }

    return {
      placesToVisit: Array.isArray(result.placesToVisit)
        ? result.placesToVisit
        : [],
      dayWisePlan: Array.isArray(result.dayWisePlan)
        ? result.dayWisePlan
        : [],
      cheapFacilities: Array.isArray(result.cheapFacilities)
        ? result.cheapFacilities
        : []
    };
  } catch (error) {
    console.error("Error in placesAgent (Gemini):", error.message);
    throw new Error(
      `Failed to generate places recommendations: ${error.message}`
    );
  }
}
