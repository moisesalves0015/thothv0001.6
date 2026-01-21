
import { GoogleGenAI } from "@google/genai";

/**
 * Fábrica de instâncias do Gemini.
 * Garante que a chave de API mais recente seja sempre utilizada.
 */
export const createAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
