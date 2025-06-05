// src/lib/api.ts

export interface ScriptPage {
  page: number;
  narrative_cn: string;
  illustration_prompt_en: string;
}

export interface ScriptResponse {
  script: ScriptPage[];
}

export interface ImageResponse {
  imageUrl: string;
}

// 建立故事
async function createStory(theme: string): Promise<number> {
  const response = await fetch('/story/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: theme, theme }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.id) throw new Error('建立故事失敗，無 id');
  return data.id;
}

// 產生腳本
async function generateStoryScript(storyId: number): Promise<void> {
  const response = await fetch(`/story/${storyId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}

// 取得腳本內容
async function getStoryScript(storyId: number): Promise<ScriptPage[]> {
  const response = await fetch(`/story/${storyId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // script_content 可能是物件，要轉成 ScriptPage[]
  if (!data.script_content || typeof data.script_content !== 'object') {
    throw new Error('API 回傳格式錯誤，無 script_content');
  }
  // 這裡假設 script_content 是陣列，或物件需轉陣列
  let scriptArr: ScriptPage[] = [];
  if (Array.isArray(data.script_content)) {
    scriptArr = data.script_content;
  } else {
    // 若是物件，取值轉陣列
    scriptArr = Object.values(data.script_content);
  }
  return scriptArr;
}

export async function generateScript(theme: string): Promise<ScriptPage[]> {
  // 1. 建立故事
  const storyId = await createStory(theme);
  // 2. 產生腳本
  await generateStoryScript(storyId);
  // 3. 取得腳本內容
  return await getStoryScript(storyId);
}

// export async function generateImage(prompt: string): Promise<string> {
//   // 尚無對應 API，暫時註解
//   throw new Error('尚未實作 generateImage，API 未提供');
// }
