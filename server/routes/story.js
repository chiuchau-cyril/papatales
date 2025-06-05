const express = require('express');
const router = express.Router();

// In-memory story DB (for demo)
let stories = [];
let idCounter = 1;

// 建立新故事
router.post('/', (req, res) => {
  const { title, theme } = req.body;
  if (!title) return res.status(400).json({ message: 'title 必填' });
  const story = {
    id: idCounter++,
    title,
    theme: theme || '',
    script_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  stories.push(story);
  res.json(story);
});

// 產生腳本
router.post('/:id/generate', async (req, res) => {
  const storyId = parseInt(req.params.id, 10);
  const story = stories.find(s => s.id === storyId);
  if (!story) return res.status(404).json({ message: '找不到故事' });

  // 假裝呼叫 GPT 產生腳本
  // 實際應該呼叫 openai，這裡 demo
  story.script_content = [
    { page: 1, narrative_cn: '第1頁內容', illustration_prompt_en: 'Page 1 prompt' },
    { page: 2, narrative_cn: '第2頁內容', illustration_prompt_en: 'Page 2 prompt' },
    { page: 3, narrative_cn: '第3頁內容', illustration_prompt_en: 'Page 3 prompt' },
  ];
  story.updated_at = new Date().toISOString();
  res.json({ message: '腳本產生完成', story });
});

// 取得故事內容
router.get('/:id', (req, res) => {
  const storyId = parseInt(req.params.id, 10);
  const story = stories.find(s => s.id === storyId);
  if (!story) return res.status(404).json({ message: '找不到故事' });
  res.json(story);
});

module.exports = router;
