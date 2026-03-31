import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

// Prevent runtime crash if key missing
if (!apiKey) {
  console.warn("Gemini API key missing. AI features will run in fallback mode.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Simple cache
const aiCache = new Map<string, any>();

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

let globalCooldownUntil = 0;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const now = Date.now();

      if (now < globalCooldownUntil) {
        const waitTime = globalCooldownUntil - now;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const timeSinceLastRequest = Date.now() - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
          setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
      }

      lastRequestTime = Date.now();
      return await fn();

    } catch (e: any) {
      lastError = e;

      const status =
        e?.status ||
        e?.error?.code ||
        e?.code ||
        e?.response?.status;

      const message = (e?.message || "").toLowerCase();

      const quota =
        status === 429 ||
        message.includes("quota") ||
        message.includes("rate");

      if (quota) {
        const cooldown = 30000 * (i + 1);
        globalCooldownUntil = Date.now() + cooldown;
      }

      const retryable =
        status === 503 ||
        quota ||
        message.includes("unavailable") ||
        message.includes("deadline") ||
        message.includes("fetch");

      if (!retryable || i === maxRetries - 1) break;

      const delay = Math.min(2000 * (i + 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/* ---------------- Demand Prediction ---------------- */

export const predictDemandTrends = async (
  city: string,
  currentStock: InventoryItem[]
): Promise<string> => {

  if (!ai) return "AI disabled.";

  const cacheKey = `demand-${city}-${currentStock.length}`;
  if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

  try {
    const result = await withRetry(async () => {
      const res = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Predict blood demand for ${city}. Data: ${JSON.stringify(currentStock.slice(0, 10))}`
      });

      return res.text || "Prediction unavailable.";
    });

    aiCache.set(cacheKey, result);
    return result;

  } catch {
    return "Prediction service offline.";
  }
};

/* ---------------- Clinical Assistant ---------------- */

export const askClinicalAssistant = async (
  query: string
): Promise<string> => {

  if (!ai) return "Clinical assistant unavailable.";

  try {
    const result = await withRetry(async () => {

      const res = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: query
      });

      return res.text || "No response.";
    });

    return result;

  } catch {
    return "Clinical service temporarily unavailable.";
  }
};

/* ---------------- Wastage Risk ---------------- */

export const analyzeWastageRisk = async (
  stock: InventoryItem[]
): Promise<string[]> => {

  if (!ai) return ["AI disabled"];

  try {
    const res = await withRetry(async () => {

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Analyze expiry risk: ${JSON.stringify(stock.slice(0, 5))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const text = response.text || "[]";

      try {
        return JSON.parse(text);
      } catch {
        return ["Manual monitoring required"];
      }
    });

    return res;

  } catch {
    return ["Risk analysis unavailable"];
  }
};

/* ---------------- Anomaly Detection ---------------- */

export const detectInventoryAnomalies = async (
  stock: InventoryItem[]
): Promise<string[]> => {

  if (!ai) return [];

  try {
    const res = await withRetry(async () => {

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Detect anomalies in inventory: ${JSON.stringify(stock.slice(0, 5))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const text = response.text || "[]";

      try {
        return JSON.parse(text);
      } catch {
        return [];
      }
    });

    return res;

  } catch {
    return [];
  }
};

/* ---------------- Smart Matching Rank ---------------- */

export const getSmartMatchingRank = async (
  item: InventoryItem
): Promise<number | null> => {

  if (!ai) return null;

  const cacheKey = `rank-${item.id}-${item.units}`;
  if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

  try {
    const result = await withRetry(async () => {

      const res = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Priority score 0-100 for ${item.bloodGroup} ${item.componentType}`
      });

      const score = parseInt(res.text || "");

      if (isNaN(score)) return null;
      return score;
    });

    if (result !== null) aiCache.set(cacheKey, result);

    return result;

  } catch {
    return null;
  }
};