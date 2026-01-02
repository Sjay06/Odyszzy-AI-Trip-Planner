// backend/src/agents/ItineraryAgent.js
import { callGeminiJSON } from "../utils/geminiClient.js";

export default async function itineraryAgent(destination, days) {
  const systemInstruction =
    "You are a travel itinerary planner. Always return valid JSON only, no extra text.";

  const prompt = `
You are a Travel Itinerary AI Agent.

DESTINATION: ${destination}
NUMBER OF DAYS: ${days}

Return JSON ONLY with this exact structure:

{
  "hotels": [
    {
      "name": "Hotel name",
      "pricePerNight": 0,
      "nights": 0,
      "area": "neighbourhood or locality",
      "category": "budget | mid-range | premium"
    }
  ],
  "activities": [
    {
      "name": "Activity or place to visit",
      "price": 0,
      "day": 1,
      "category": "sightseeing | culture | nature | adventure | food",
      "notes": "short note about what/why"
    }
  ],
  "transportKm": 0
}

Rules for HOTELS:
- Always provide between 2 and 3 distinct hotel options.
- All hotels must be realistically located in or very near ${destination}.
- Use realistic INR prices per night for the destination and category.
- Set "nights" so that the total nights roughly matches NUMBER OF DAYS.
- Use a mix of categories if possible (e.g., one budget, one mid-range, one premium).

Rules for ACTIVITIES:
- Create activities for EVERY day from 1 to ${days} inclusive.
- Each day must have AT LEAST 3 and AT MOST 5 activities.
- Use integer day numbers only (1,2,3,...).
- Use realistic INR prices; set price 0 for free attractions like public beaches, viewpoints, temples without entry fee, etc.
- Make sure you cover the MAIN must-visit attractions and typical experiences in ${destination}
  (e.g., famous landmarks, viewpoints, local markets, important temples/churches/heritage sites, key beaches, signature local experiences).
- Avoid repeating the same attraction on different days unless it clearly makes sense.

Rules for TRANSPORT:
- "transportKm" is the approximate total local travel distance for the whole trip in km.
- Use a realistic but rough estimate based on typical sightseeing patterns in ${destination}.

Return ONLY the JSON object, no explanation or markdown. Ensure it is strictly valid JSON.
`;

  const raw = await callGeminiJSON(prompt, systemInstruction);

  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response from ItineraryAgent Gemini");
  }

  const hotels = Array.isArray(raw.hotels) ? raw.hotels : [];
  let activities = Array.isArray(raw.activities) ? raw.activities : [];
  const transportKm =
    typeof raw.transportKm === "number" ? raw.transportKm : 0;

  // Ensure every day 1..days has at least one activity
  const byDay = new Map();
  for (const a of activities) {
    const d =
      typeof a.day === "number" && a.day >= 1 && a.day <= days
        ? a.day
        : null;
    if (d == null) continue;
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(a);
  }

  for (let d = 1; d <= days; d++) {
    if (!byDay.has(d)) {
      byDay.set(d, [
        {
          name: "Free day / Self‑exploration",
          price: 0,
          day: d,
          category: "flex",
          notes: "Buffer/free time in case user wants to rest or add custom plans",
        },
      ]);
    }
  }

  const fixedActivities = [];
  Array.from(byDay.keys())
    .sort((a, b) => a - b)
    .forEach((d) => {
      byDay.get(d).forEach((a) => fixedActivities.push(a));
    });

  return {
    hotels,
    activities: fixedActivities,
    transportKm,
  };
}
