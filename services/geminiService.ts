import { GoogleGenAI, Type } from "@google/genai";
import { Criterion, AnalysisResponse } from "../types";

export const analyzeScores = async (data: Criterion[]): Promise<AnalysisResponse> => {
  // Use process.env.API_KEY directly as per guidelines.
  // The environment variable is assumed to be pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Bạn là một chuyên gia về Cải cách hành chính tại Việt Nam, đặc biệt am hiểu về Quyết định 766/QĐ-TTg của Thủ tướng Chính phủ.
    
    Hãy phân tích dữ liệu điểm số sau đây của một đơn vị hành chính:
    ${JSON.stringify(data, null, 2)}
    
    Tổng điểm tối đa là 100.
    
    Hãy cung cấp:
    1. Một đoạn tóm tắt ngắn gọn về tình hình chung (summary).
    2. 3-4 khuyến nghị cụ thể (recommendations) để cải thiện điểm số, tập trung vào các tiêu chí có điểm thấp hoặc chênh lệch lớn so với điểm tối đa.
       Mỗi khuyến nghị cần có tiêu đề (title), nội dung chi tiết (advice), và mức độ ưu tiên (priority: High, Medium, Low).
       
    Trả về định dạng JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }
    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};