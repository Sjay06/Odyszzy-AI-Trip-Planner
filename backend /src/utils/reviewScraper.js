// src/utils/reviewScraper.js
import { config } from "dotenv";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Call SerpApi Google Search API directly via HTTP.
 */
async function callSerpApiGoogleSearch(params) {
  if (!SERPAPI_KEY) {
    throw new Error("SERPAPI_KEY is not set in environment variables.");
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", SERPAPI_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpApi error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Find 3–4 recent blog‑style pages about the city.
 * Uses SerpApi Google search.
 * Returns: [{ url, title, type: "blog" }, ...]
 */
export async function fetchCityReviewSources(city) {
  const query = `${city} city review travel blog`;
  console.log("[fetchCityReviewSources] query =", query);

  const results = await callSerpApiGoogleSearch({
    q: query,
    hl: "en",
    num: "6",
    location: "India",
    google_domain: "google.co.in",
    gl: "in"
  });

  console.log(
    "[fetchCityReviewSources] organic_results length =",
    (results.organic_results || []).length
  );
  
  const organic = results.organic_results || [];

  // Filter out obvious non‑travel / utility pages
  const filtered = organic.filter((r) => {
    const link = r.link || "";
    return (
      link &&
      !link.includes("wikipedia.org") &&
      !link.includes("google.com/maps") &&
      !link.includes("tripadvisor.in/Flights")
    );
  });

  return filtered.slice(0, 4).map((r) => ({
    url: r.link,
    title: r.title,
    type: "blog"
  }));
}

/**
 * Fetch article HTML and clean into plain text for Gemini.
 * For now, only "blog" type is handled; YouTube transcripts can be added later.
 */
export async function fetchAndCleanText(source) {
  if (source.type !== "blog") {
    return "";
  }

  const res = await fetch(source.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    }
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const text =
    $("article").text() ||
    $("main").text() ||
    $("#content").text() ||
    $("body").text();

  return text.replace(/\s+/g, " ").trim().slice(0, 15000);
}
