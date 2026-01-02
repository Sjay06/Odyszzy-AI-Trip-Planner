// backend/src/agents/PackingListAgent.js
import { callGeminiJSON } from "../utils/geminiClient.js";

export default async function packingListAgent({
  destination,
  startDate,
  endDate,
  tripType,
  preferences,
}) {
  const prefText = preferences || "none specified";

  const prompt = `
You are a travel assistant creating a packing checklist.

Destination: ${destination}
Trip type: ${tripType}
Dates: ${startDate} to ${endDate}
Traveler preferences: ${prefText}

Using up-to-date climate and travel norms, create a concise packing list tailored
to this trip. Consider:
- Typical weather and temperature for those dates at that destination.
- Local culture/dress norms.
- Trip type (business vs leisure vs adventure).
- The fact this is an international traveler.

Return a SHORT JSON object ONLY in this exact shape, no extra text:

{
  "essentials": ["item1", "item2", ...],
  "clothing": ["item1", "item2", ...],
  "electronics": ["item1", "item2", ...],
  "documents": ["item1", "item2", ...],
  "extras": ["item1", "item2", ...]
}
`;

  const parsed = await callGeminiJSON(prompt); // this exists in geminiClient.js[file:32]
  // const parsed = await callGeminiJSONGrounded(prompt);


  return {
    essentials: parsed.essentials || [],
    clothing: parsed.clothing || [],
    electronics: parsed.electronics || [],
    documents: parsed.documents || [],
    extras: parsed.extras || [],
  };
}
