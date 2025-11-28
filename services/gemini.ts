import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Text Generation with Search Grounding
export const generateTextWithSearch = async (prompt: string, useSearch: boolean = false) => {
  const ai = getClient();
  const tools = useSearch ? [{ googleSearch: {} }] : [];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: tools,
      }
    });

    const text = response.text || "No response generated.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        uri: c.web.uri,
        title: c.web.title
      }));

    return { text, sources };
  } catch (error) {
    console.error("Text Gen Error:", error);
    throw error;
  }
};

// 2. Specialized Text Generation (Grammar, Spelling, YouTube, CV)
export const generateSpecializedText = async (
  prompt: string, 
  systemInstruction: string,
  model: string = "gemini-2.5-flash"
) => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Specialized Text Error:", error);
    throw error;
  }
};

// 2b. Structured CV Generation
export const generateCVJson = async (data: any) => {
  const ai = getClient();
  const prompt = `
    You are an expert professional resume writer. Transform the following raw user data into a professional CV.
    Improve the language to be action-oriented, concise, and professional. 
    Make it suitable for the role of "${data.role}".

    User Data:
    Name: ${data.name}
    Role Target: ${data.role}
    Raw Experience Input: ${data.experience}
    Raw Education Input: ${data.education}
    Raw Skills Input: ${data.skills}

    Return a strictly valid JSON object with this structure:
    {
      "summary": "A strong professional summary (3-4 sentences)",
      "work_history": [
        {
          "role": "Job Title",
          "company": "Company Name",
          "duration": "Date Range (e.g. Jan 2020 - Present)",
          "description": ["Action oriented bullet point 1", "Action oriented bullet point 2", "Action oriented bullet point 3"]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "School/University",
          "year": "Year"
        }
      ],
      "technical_skills": ["Skill 1", "Skill 2", "Skill 3"],
      "soft_skills": ["Skill 1", "Skill 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("CV JSON Error:", error);
    throw error;
  }
};

// 3. Image Generation
export const generateImage = async (prompt: string) => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        // No responseMimeType for this model
      }
    });
    
    // Iterate to find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// 4. Image Editing (Nano Banana)
export const editImage = async (base64Image: string, prompt: string, mimeType: string) => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// 5. Veo Video Generation
export const generateVeoVideo = async (
  prompt: string, 
  base64Image?: string, 
  mimeType?: string, 
  aspectRatio: '16:9' | '9:16' = '16:9'
) => {
  // Check for paid key selection
  if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
     throw new Error("API_KEY_REQUIRED");
  }

  // RE-INIT with potentially new key from selection
  const ai = getClient(); 

  try {
    let config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    };
    
    let args: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: config
    };

    if (base64Image && mimeType) {
      args.image = {
        imageBytes: base64Image,
        mimeType: mimeType
      };
    }

    let operation = await ai.models.generateVideos(args);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
