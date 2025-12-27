
/* 
 * Enhanced Gemini Service layer.
 * Manages conversation states, multimodal queries, and JSON response hardening.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiObjectDetection } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Hardened JSON parser to handle potential Gemini formatting edge cases.
 */
function sanitizeJson(raw: string): string {
  // Remove markdown code blocks if present
  let clean = raw.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json/, "").replace(/```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```/, "").replace(/```$/, "");
  }
  return clean.trim();
}

/**
 * Validates the schema of the returned objects to ensure stability.
 */
function validateObjects(data: any): GeminiObjectDetection[] {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    name: String(item.name || "Unknown Object"),
    confidence: Number(item.confidence || 0),
    boundingBox: {
      ymin: Number(item.boundingBox?.ymin || 0),
      xmin: Number(item.boundingBox?.xmin || 0),
      ymax: Number(item.boundingBox?.ymax || 1000),
      xmax: Number(item.boundingBox?.xmax || 1000),
    },
    description: String(item.description || ""),
  }));
}

/**
 * Uses Gemini to identify and segment objects within a base64 image.
 * Returns a list of structured object detections with bounding box coordinates.
 */
export const detectObjectsInImage = async (
  base64Image: string,
  mimeType: string
): Promise<GeminiObjectDetection[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: "List every distinct object in this image. For each object, provide a name, confidence score (0-1), a short description, and a bounding box in normalized coordinates (0-1000) using the schema keys: ymin, xmin, ymax, xmax." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            boundingBox: {
              type: Type.OBJECT,
              properties: {
                ymin: { type: Type.NUMBER },
                xmin: { type: Type.NUMBER },
                ymax: { type: Type.NUMBER },
                xmax: { type: Type.NUMBER },
              },
              required: ["ymin", "xmin", "ymax", "xmax"],
            },
          },
          required: ["name", "confidence", "description", "boundingBox"],
        },
      },
    },
  });

  try {
    const rawText = response.text || "[]";
    const data = JSON.parse(sanitizeJson(rawText));
    return validateObjects(data);
  } catch (error) {
    console.error("Failed to parse Gemini object detection:", error);
    return [];
  }
};

/**
 * Request specific alpha-mask generation for an object.
 * This utilizes Gemini's reasoning to describe how an object should be cut out.
 */
export const requestMaskingDescription = async (
  base64Image: string,
  objectName: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/png" } },
          { text: `Precisely describe the edges and contours of the ${objectName} in this image. Focus on what parts are solid and what are shadows or semi-transparent.` }
        ]
      }
    ]
  });
  return response.text || "";
};
