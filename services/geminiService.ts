import { GoogleGenAI } from "@google/genai";

// We use Gemini 3 Pro Preview for advanced reasoning to help refine prompts
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Uses Gemini to refine or generate a prompt based on a rough description.
 */
export const refinePromptWithAI = async (currentText: string, instruction: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `
      You are an expert Prompt Engineer. 
      User Input: "${currentText}"
      User Instruction: "${instruction}"
      
      Task: Rewrite the user input into a highly effective, professional system prompt based on the instruction. 
      Return ONLY the refined prompt text. Do not add markdown quotes or explanations.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Use thinking for better quality prompt engineering
      }
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};