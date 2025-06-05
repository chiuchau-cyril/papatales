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