import { callGeminiJSON } from "../utils/geminiClient.js";
/**
 * Activity Agent using Gemini
 */
export default async function activityAgent(destination, budget = null) {
  const systemInstruction =
    "You are a travel activities expert with knowledge of attractions and experiences worldwide. " +
    "Always return valid JSON only. Provide realistic prices in INR.";

  const budgetText = budget
    ? `BUDGET CONSTRAINT: about ${budget} INR per activity if possible.`
    : "No strict budget constraint.";

  const prompt = `
DESTINATION: ${destination}
${budgetText}

Return JSON ONLY with this exact structure:

{
  "activities": [
    {
      "name": "Activity name specific to ${destination}",
      "price": 0,
      "category": "sightseeing | cultural | nature | adventure | food | shopping",
      "duration": "2-3 hours" ,
      "type": "guided | self-guided | free",
      "description": "Brief description"
    }
  ]
}

Rules:
- Include 5-8 activities.
- Mix of free and paid.
- Prices realistic for ${destination} in INR.
- Include famous attractions and some local experiences.
`;

  const result = await callGeminiJSON(prompt, systemInstruction);

  if (!Array.isArray(result.activities)) {
    throw new Error("Invalid response format from ActivityAgent (Gemini)");
  }

  return result.activities;
}
