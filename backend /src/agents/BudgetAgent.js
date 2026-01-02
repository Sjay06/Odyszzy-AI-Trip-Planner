// backend/src/agents/BudgetAgent.js
import costEstimator from "../utils/costEstimator.js";
import { callGeminiJSON } from "../utils/geminiClient.js";

/**
 * BudgetAgent using Gemini
 * Input: itinerary object, total budget (INR)
 * Output: { optimizedItinerary, finalCost, initialCost, warnings[] }
 */
export default async function budgetAgent(itinerary, budget) {
  if (!itinerary || typeof itinerary !== "object") {
    throw new Error("Invalid itinerary: must be an object");
  }

  // --- base (initial) cost ---
  const initialCost = costEstimator.totalCost({
    hotels: costEstimator.estimateHotelCost(itinerary.hotels),
    activities: costEstimator.estimateActivityCost(itinerary.activities),
    transport: costEstimator.estimateTransportCost(itinerary.transportKm),
  });

  const systemInstruction =
    "You are a travel budget optimization assistant. " +
    "Always return strictly valid JSON, no extra text.";

  const prompt = `
You are a Travel Budget Optimization AI Agent.

Given this itinerary (JSON):
${JSON.stringify(itinerary, null, 2)}

Total Budget: ₹${budget}
Current Estimated Cost: ₹${initialCost}

Optimization goals:
1. Replace costly hotels with cheaper but safe and reasonably rated options.
2. Replace or remove very expensive activities while keeping the trip enjoyable.
3. Try to reduce transport distance where possible.
4. Keep the structure of days similar where you can.
5. Ensure final total cost is less than or equal to the given budget if realistic.
6. If it is impossible to fit within the budget, keep best-effort optimization and add warnings explaining why.

Return JSON ONLY with this exact structure:

{
  "optimizedItinerary": {
    "hotels": [{ "name": "string", "pricePerNight": 0, "nights": 0 }],
    "activities": [{ "name": "string", "price": 0, "day": 1 }],
    "transportKm": 0
  },
  "finalCost": 0,
  "warnings": [
    "Short warning message 1",
    "Short warning message 2"
  ]
}
`;

  try {
    const result = await callGeminiJSON(prompt, systemInstruction);

    if (
      !result ||
      typeof result !== "object" ||
      !result.optimizedItinerary ||
      typeof result.finalCost !== "number"
    ) {
      throw new Error("Invalid response format from BudgetAgent (Gemini)");
    }

    return {
      optimizedItinerary: result.optimizedItinerary,
      finalCost: result.finalCost,
      initialCost, // <— base cost added here
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
    };
  } catch (error) {
    console.error("Error in budgetAgent (Gemini):", error.message);
    throw new Error(`Failed to optimize budget: ${error.message}`);
  }
}
