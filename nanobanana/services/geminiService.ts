
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("이미지 생성에 실패했습니다. 응답에 이미지가 없습니다.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("이미지 생성 중 오류가 발생했습니다.");
    }
};

export const editImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    try {
        const parts = base64ImageData.split(',');
        if (parts.length !== 2) {
            throw new Error("유효하지 않은 base64 데이터 URI입니다.");
        }
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const imageData = parts[1];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             const base64ImageBytes = imagePart.inlineData.data;
             return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        } else {
            throw new Error("이미지 수정에 실패했습니다. 응답에 이미지가 없습니다.");
        }

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("이미지 수정 중 오류가 발생했습니다.");
    }
};
