import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            amount: { type: Type.STRING },
          },
          required: ["item", "amount"],
        },
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      prepTime: { type: Type.STRING },
      cookTime: { type: Type.STRING },
      servings: { type: Type.NUMBER },
      difficulty: { type: Type.STRING, enum: ["Fácil", "Media", "Difícil"] },
    },
    required: ["id", "name", "description", "ingredients", "steps", "prepTime", "cookTime", "servings", "difficulty"],
  },
};

export async function generateRecipes(recipeName: string): Promise<Recipe[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera 3 versiones mejoradas y deliciosas de la receta: "${recipeName}". 
      Cada versión debe tener un toque único o una mejora técnica. 
      Responde en español y asegúrate de que los pasos sean claros y detallados.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    if (!response.text) {
      throw new Error("No se pudo generar el contenido");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
}
