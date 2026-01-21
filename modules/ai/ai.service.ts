
import { createAiClient } from "../../infra/gemini";
import { GenerateContentResponse } from "@google/genai";

export class AiService {
  /**
   * Chat com suporte a Google Search Grounding
   */
  static async chat(prompt: string) {
    const ai = createAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Sem resposta.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({ uri: chunk.web?.uri || '', title: chunk.web?.title || 'Fonte' }));

    return { text, urls };
  }

  /**
   * Geração de Imagens via Gemini 2.5 Flash Image
   */
  static async generateImage(prompt: string, aspectRatio: string) {
    const ai = createAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Falha ao gerar imagem.");
  }

  /**
   * Geração de Vídeos via Veo 3.1
   */
  static async generateVideo(prompt: string, onProgress: (msg: string) => void) {
    const ai = createAiClient();
    onProgress('Iniciando Veo...');
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      onProgress('Processando cena...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      // @ts-ignore
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("URI do vídeo não encontrada.");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
