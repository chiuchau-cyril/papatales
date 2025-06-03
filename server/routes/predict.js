require('dotenv').config();
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /predict/script - 產生 GPT 劇本
router.post('/script', async (req, res) => {
  const { theme } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是專業繪本編劇，請將主題轉為 3 頁故事，每頁含：1）中文敘述 2）插圖描述（英文）',
        },
        { role: 'user', content: theme }
      ]
    });

    res.json({ script: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating script');
  }
});

// POST /predict/image - 使用 DALL·E 產圖
router.post('/image', async (req, res) => {
  const { prompt } = req.body;

  try {
    const imageResp = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024'
    });

    res.json({ imageUrl: imageResp.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating image');
  }
});

module.exports = router;