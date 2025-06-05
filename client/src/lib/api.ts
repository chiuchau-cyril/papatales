// src/lib/api.ts

export interface ScriptPage {
  page: number;
  narrative_cn: string;
  illustration_prompt_en: string;
}

export interface ScriptResponse {
  script: ScriptPage[]; // Assuming the script is an array of ScriptPage objects
}

export interface ImageResponse {
  imageUrl: string;
}

export async function generateScript(theme: string): Promise<ScriptPage[]> {
  try {
    const response = await fetch('/api/predict/script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ScriptResponse = await response.json();
    if (!data.script || !Array.isArray(data.script)) {
        // Log the actual data received for debugging
        console.error('Invalid script data structure received:', data);
        throw new Error('Invalid script data structure received from API.');
    }
    return data.script;
  } catch (error) {
    console.error('Failed to generate script:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/predict/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ImageResponse = await response.json();
    if (typeof data.imageUrl !== 'string') {
        console.error('Invalid image data structure received:', data);
        throw new Error('Invalid image data structure received from API. "imageUrl" must be a string.');
    }
    return data.imageUrl;
  } catch (error) {
    console.error('Failed to generate image:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}
