// src/agents/ReviewInsightsAgent.js
import { fetchCityReviewSources, fetchAndCleanText } from "../utils/reviewScraper.js";
import { callGeminiJSON } from "../utils/geminiClient.js";

export class ReviewInsightsAgent {
  async run(city) {
    if (!city) {
      throw new Error("city is required");
    }

    const sources = await fetchCityReviewSources(city);
    console.log("[ReviewInsightsAgent] sources found:", sources.length);


    if (!sources.length) {
      return {
        city,
        summary:
          `Could not find enough recent traveler reviews for ${city}. ` +
          "Try another city or check back later.",
        love: [],
        complaints: [],
        tips: []
      };
    }

    const texts = await Promise.all(
      sources.map((src) => fetchAndCleanText(src))
    );

    const mergedContext = texts.join("\n\n---\n\n").slice(0, 30000);
    console.log(
      "[ReviewInsightsAgent] mergedContext length:",mergedContext.length
      );


    const systemInstruction = `
      You are a travel review analyst.
      You read recent blog posts and city review articles about destinations.
      Your job is to extract a realistic, balanced picture of what visitors
      are saying right now. You must ALWAYS return STRICTLY valid JSON and
      no extra text outside JSON.
    `;

    const prompt = `
Return ONLY valid JSON. Do not include any explanation text before or after.

CITY: ${city}

CONTEXT FROM RECENT BLOGS AND CITY REVIEW POSTS:
${mergedContext}

TASKS:
1. Write a 2–3 paragraph overview that captures the current vibe of ${city}
   for visitors (tone: neutral but practical).
2. Then produce 3 sections of bullet points:
   - "What people love" (3–5 bullets)
   - "Common complaints" (3–5 bullets)
   - "Tips from recent visitors" (3–5 bullets)
3. Use relative time phrases like "recently" or "in the last few years"
   instead of exact dates.
4. Ignore personal names and private details; focus on places, logistics,
   pros/cons, and experience.

JSON SHAPE:

{
  "summary": "2–3 paragraph natural-language overview.",
  "love": ["bullet 1", "bullet 2", "..."],
  "complaints": ["bullet 1", "bullet 2", "..."],
  "tips": ["bullet 1", "bullet 2", "..."]
}
    `;

    const result = await callGeminiJSON(prompt, systemInstruction);
    console.log("ReviewInsightsAgent Gemini result:", result);

    if (!result || typeof result !== "object" || !result.summary) {
      throw new Error("Invalid response format from ReviewInsightsAgent Gemini");
    }

    return {
      city,
      summary: result.summary,
      love: Array.isArray(result.love) ? result.love : [],
      complaints: Array.isArray(result.complaints) ? result.complaints : [],
      tips: Array.isArray(result.tips) ? result.tips : []
    };
  }
}
