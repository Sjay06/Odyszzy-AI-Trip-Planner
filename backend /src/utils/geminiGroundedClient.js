// backend/src/utils/geminiGroundedClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ----------------------------------------------
   GET GEMINI KEY
---------------------------------------------- */
function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return key;
}

/* ----------------------------------------------
   MODEL (use tools-capable)
---------------------------------------------- */
const MODEL_NAME = "gemini-2.5-pro"; // tools + better reasoning[web:108]

/* ----------------------------------------------
   CLEAN JSON FROM CODE BLOCKS
---------------------------------------------- */
function extractJsonString(text) {
    if (!text) return "";
  
    let cleaned = text.trim();
  
    // remove ```json or ``` fences
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```[a-zA-Z]*/, "")  // remove ``` or ```json
        .replace(/```$/, "")           // remove ending ```
        .trim();
    }
  
    // remove stray backticks
    cleaned = cleaned.replace(/`+/g, "").trim();
  
    return cleaned;
  }

/* ----------------------------------------------
   SINGLE GROUNDED CALL RETURNING PARSED JSON
---------------------------------------------- */
export async function callGeminiJSONGrounded(
  prompt,
  systemInstruction = ""
) {
  const apiKey = getGeminiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const contents = [];

  if (systemInstruction) {
    contents.push({
      role: "user",
      parts: [{ text: systemInstruction }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const request = {
    contents,
    generationConfig: {
      temperature: 0.7,
    },
    tools: [
      {
        google_search_retrieval: {},
      },
    ],
  };

  try {
    const result = await model.generateContent(request);
  
    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
    if (!rawText) {
      throw new Error("Empty response from grounded Gemini");
    }
  
    const jsonText = extractJsonString(rawText);
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Grounded Gemini error:", err.message);
    throw err;
  }
}