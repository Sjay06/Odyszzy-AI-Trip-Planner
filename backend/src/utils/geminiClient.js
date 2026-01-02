import axios from "axios";

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
   MODELS + AUTO-FALLBACK
---------------------------------------------- */
let MODEL_NAME = "models/gemini-2.5-flash";  // primary model
const FALLBACK_MODEL = "models/gemini-2.5-pro";  // backup when flash is overloaded

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
   RETRY SYSTEM (handles 503 overload)
---------------------------------------------- */
async function retryRequest(fn, retries = 3, delay = 600) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;

    console.warn(`⚠️ Gemini retrying... attempts left: ${retries}`);
    await new Promise((res) => setTimeout(res, delay));

    return retryRequest(fn, retries - 1, delay * 2); // exponential backoff
  }
}

/* ----------------------------------------------
   CALL GEMINI AND RETURN JSON
---------------------------------------------- */
export async function callGeminiJSON(prompt, systemInstruction = "") {
  const GEMINI_KEY = getGeminiKey();
  const url = `https://generativelanguage.googleapis.com/v1/${MODEL_NAME}:generateContent`;

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

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
    },
  };

  try {
    // RUN WITH RETRY
    const { data } = await retryRequest(() =>
      axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_KEY,
        },
      })
    );

    // EXTRACT TEXT SAFELY
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      throw new Error("Empty response from Gemini");
    }

    const jsonText = extractJsonString(rawText);

    return JSON.parse(jsonText);
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data || err.message;

    console.error("Gemini API error status:", status);
    console.error("Gemini API error data:", message);

    // AUTO-FALLBACK TO PRO WHEN FLASH IS BUSY
    if (status === 503 && MODEL_NAME === "models/gemini-2.5-flash") {
      console.warn("⚠️ Flash overloaded → switching to gemini-2.5-pro...");
      MODEL_NAME = FALLBACK_MODEL;

      // retry automatically using PRO
      return callGeminiJSON(prompt, systemInstruction);
    }

    throw new Error(
      "Gemini API call failed: " + (err.response?.statusText || err.message)
    );
  }
}
