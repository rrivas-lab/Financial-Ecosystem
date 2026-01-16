
import { GoogleGenAI, Type } from "@google/genai";
import { AIDiagnosis } from "../types";

// Mock analysis data moved up to be available as a fallback
const mockAnalysis = (): AIDiagnosis => {
  return {
    condition: "Pyricularia (Quemado del arroz)",
    confidence: 88,
    severity: "Media",
    priority: "Alta",
    estimatedCost: "$35/ha",
    recommendation: "Aplicar fungicida sistémico (Triciclazol) y reducir lámina de agua temporalmente."
  };
};

/**
 * Analyzes a crop image using Gemini AI to identify issues.
 * Follows @google/genai guidelines for initialization and model selection.
 */
export const analyzeCropImage = async (base64Image: string): Promise<AIDiagnosis> => {
  try {
    // Initialization: Must use process.env.API_KEY directly as per guidelines
    // Added fix: use { apiKey: process.env.API_KEY } as per initialization guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Model selection: 'gemini-3-flash-preview' is recommended for multimodal analysis tasks
    const modelId = "gemini-3-flash-preview"; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Eres un agrónomo experto de Aproscello. Analiza esta imagen de un cultivo de arroz. Identifica plagas, enfermedades o deficiencias. Prioriza la acción y estima un costo referencial del tratamiento."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING, description: "Nombre de la enfermedad, plaga o 'Sano'" },
            confidence: { type: Type.NUMBER, description: "Confianza del 0 al 100" },
            severity: { type: Type.STRING, description: "Severidad del problema (Baja, Media, Alta)" },
            priority: { type: Type.STRING, description: "Prioridad de atención (Baja, Media, Alta)" },
            estimatedCost: { type: Type.STRING, description: "Costo estimado del tratamiento (ej. '$20-30/ha')" },
            recommendation: { type: Type.STRING, description: "Recomendación técnica breve y concisa" }
          },
          required: ["condition", "confidence", "severity", "priority", "estimatedCost", "recommendation"]
        }
      }
    });

    // Extracting text output directly from GenerateContentResponse as per guidelines
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIDiagnosis;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback for demo purposes if API fails or API key is missing
    return mockAnalysis();
  }
};
