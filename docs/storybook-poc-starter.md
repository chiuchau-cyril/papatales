# **storybook-poc-starter.js**

## ** – 快速建立後端 API**

這個檔案目的是作為 PapaTales 或類似 AI 插圖故事書專案的後端 API 起手式，用來串接 OpenAI、圖像生成模組與故事資料儲存邏輯。以下是一個以 Node.js（Express）為基礎的起始範例，未來可擴充支援 Groq、DALL·E、或你自定義的圖像模組與記憶體控制機制。

---

### **📁** ****

### **storybook-poc-starter.js**

```
// storybook-poc-starter.js
import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

// 🔐 可加上 API 金鑰環境變數
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// 🧠 基本故事文字生成
app.post('/api/generate-story', async (req, res) => {
  const { title, character, theme, language = 'zh-Hant' } = req.body

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是專業的兒童故事書編劇，會用溫暖、童趣、富有畫面感的方式描述故事。',
          },
          {
            role: 'user',
            content: `請用${language}寫一個以「${title}」為題，主角是${character}，主題為${theme}的兒童故事，分成六段，每段100字左右。`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    )

    res.json({ id: uuidv4(), story: response.data.choices[0].message.content })
  } catch (error) {
    console.error('Error generating story:', error)
    res.status(500).json({ error: 'Failed to generate story.' })
  }
})

app.listen(PORT, () => {
  console.log(`📖 Storybook backend starter is running on http://localhost:${PORT}`)
})
```

---

### **🔧 後續擴充建議**

| **模組功能** | **建議實作方式**                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| 插圖生成           | /api/generate-illustration**endpoint，串接 DALL·E 或 SDXL**              |
| 多角色風格統一     | /api/generate-character-consistent-image**，可參考**multi-character-strategy.md |
| 進度儲存與載入     | 可加上 Firebase / Supabase 儲存 story ID 與內容                                 |
| 插圖預覽前端串接   | **對應**prompt-preview-ui.md**，建立**/api/prompt-preview                 |
