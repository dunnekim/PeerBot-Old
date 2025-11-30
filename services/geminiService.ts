import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_PROMPT } from '../constants';
import { AnalysisResult } from '../types';

export const analyzeBusiness = async (bizDesc: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const genAI = new GoogleGenAI({ apiKey });
  const model = genAI.models;
  
  try {
    const result = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${INITIAL_PROMPT}\n${bizDesc}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (result.text) {
      return JSON.parse(result.text) as AnalysisResult;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("분석 중 오류가 발생했습니다. API Key를 확인해주세요.");
  }
};