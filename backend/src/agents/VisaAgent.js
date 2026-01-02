// import { callGeminiJSONGrounded } from "../utils/geminiGroundedClient.js";
import { callGeminiJSON } from "../utils/geminiClient.js";

export default async function visaAgent(nationality, destinationCountry) {
  if (!nationality || !destinationCountry) {
    throw new Error("nationality and destinationCountry are required");
  }

  const systemInstruction = `
    You are a visa and immigration assistant.
    Use realistic, up-to-date knowledge about typical tourist visa rules.
    However, you are NOT an official source and must always tell users
    to verify with the official embassy or consulate.
    Always return STRICTLY valid JSON. Do NOT include any text outside JSON.
  `;

  const prompt = `
NATIONALITY: ${nationality}
DESTINATION COUNTRY: ${destinationCountry}

TASK:
- Describe typical tourist visa requirements for this nationality visiting this country.
- Indicate clearly if visa is required, not required, visa-on-arrival, or depends on duration/purpose.
- Provide realistic processing time ranges and approximate fees when a visa is required.
- List common documents usually requested.
- Use simple language and short bullet-point style notes.

Return JSON ONLY with this exact structure:

{
  "visaRequired": "yes" | "no" | "depends",
  "visaType": "tourist" | "schengen" | "e-visa" | "visa-on-arrival" | "none" | "varies",
  "processingTime": "string, e.g., '10–15 working days' or 'usually 3–5 days for e‑visa'",
  "fees": "string, e.g., 'Around 80 EUR' or 'Varies by consulate'",
  "stayLimit": "string, e.g., 'Up to 90 days in a 180‑day period'",
  "entryType": "single" | "multiple" | "varies",
  "documents": [
    "Passport valid for at least X months beyond travel date",
    "Recent passport-size photographs",
    "Proof of sufficient funds / bank statements",
    "Confirmed return or onward ticket",
    "Travel insurance (if commonly required)",
    "Hotel booking or invitation letter",
    "Completed visa application form"
  ],
  "notes": [
    "Short additional remark 1",
    "Short additional remark 2"
  ],
  "summary": "2–3 sentence plain English explanation of the requirements.",
  "disclaimer": "Always confirm with the official embassy or consulate before making travel decisions."
}
  `;

  const result = await callGeminiJSON(prompt, systemInstruction);
  // const result = await callGeminiJSONGrounded(prompt);

  // Basic validation to avoid crashing caller
  if (!result || typeof result !== "object" || !result.summary) {
    throw new Error("Invalid response format from VisaAgent Gemini");
  }

  return result;
}
