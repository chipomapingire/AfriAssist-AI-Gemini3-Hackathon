
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile } from "./types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export interface SearchFilters {
  experienceLevel?: string;
  industry?: string;
  salaryRange?: string;
}

export const searchOpportunities = async (query: string, profile?: UserProfile, filters?: SearchFilters) => {
  const ai = getGeminiClient();
  
  let contextualPrompt = `Find recent jobs, business opportunities, or grants specifically in African markets. Provide actionable links.`;
  
  if (query) {
    contextualPrompt += ` Primary Search Query: ${query}.`;
  }

  if (filters) {
    if (filters.industry) contextualPrompt += ` \n- Target Industry: ${filters.industry}`;
    if (filters.experienceLevel) contextualPrompt += ` \n- Required Experience Level: ${filters.experienceLevel}`;
    if (filters.salaryRange) contextualPrompt += ` \n- Target Salary/Funding Range: ${filters.salaryRange}`;
  }

  if (profile) {
    contextualPrompt += ` \n\nContext for personalization:
    - User is based in: ${profile.location}
    - Skills: ${profile.skills}
    - Experience Level: ${profile.experienceLevel}
    - Aspirations: ${profile.careerAspirations}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contextualPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are AfriAssist AI. Help users find real, vetted opportunities in Africa. Always provide direct URLs."
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    title: chunk.web?.title || 'Opportunity Link',
    uri: chunk.web?.uri || ''
  })).filter(s => s.uri !== '');

  return {
    text: response.text,
    sources
  };
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const searchLocalMap = async (query: string, location: { lat: number, lng: number }) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-latest",
    contents: `Find business centers, job hubs, or networking spots near ${query} around these coordinates.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      }
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const places = groundingChunks.map((chunk: any) => ({
    title: chunk.maps?.title || 'Location',
    uri: chunk.maps?.uri || ''
  })).filter(s => s.uri !== '');

  return {
    text: response.text,
    places
  };
};

export const generateProfessionalAvatar = async (profile: UserProfile) => {
  const ai = getGeminiClient();
  const prompt = `A professional, ultra-realistic headshot of an African professional named ${profile.fullName} who is a ${profile.experienceLevel} level expert in ${profile.skills}. The background is a modern, high-tech office in ${profile.location}. 8k resolution, cinematic lighting, corporate attire.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const reviewDocument = async (base64Data: string, mimeType: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this resume/CV. Provide a professional score (1-100), detailed feedback, and specific improvements. Identify 3-5 specific snippets of text for improvement with originalText, suggestedText, and reason." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: { type: Type.STRING },
                suggestedText: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzeMedia = async (base64Data: string, mimeType: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this pitch. Rate clarity, confidence, and presence. Provide feedback on Global Accent Clarity and actionable recommendations." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate to ${targetLanguage}: "${text}". Keep it professional.`,
  });

  return response.text;
};

export const generateMotivationalVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  onProgress("Initializing cinematic engine...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    onProgress("Crafting your visual future...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// PCM Encoding/Decoding Utilities
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
