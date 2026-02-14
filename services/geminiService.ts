
import { GoogleGenAI } from "@google/genai";

export const getDiscoveryDescription = async (siteName: string, category: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a catchy one-sentence description for a website named "${siteName}" which falls under the category of "${category}". Keep it under 15 words.`,
    });
    return response.text?.trim() || "An interesting corner of the web.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A curated discovery for you.";
  }
};

export const getAdminInsights = async (topSites: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given these popular websites on our platform: ${topSites.join(", ")}, what's a short 2-sentence analytical insight about user trends?`,
    });
    return response.text?.trim() || "Users are currently showing high interest in social and tech resources.";
  } catch (error) {
    return "Insights unavailable.";
  }
};
