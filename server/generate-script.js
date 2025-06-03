// 🧠 用 GPT-4 產出故事腳本（3頁）
app.post('/generate-script', async (req, res) => {
    const { theme } = req.body;
  
    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是專業繪本編劇，請將主題轉為 3 頁故事，每頁含：1）中文敘述 2）插圖描述（英文）'
          },
          {
            role: 'user',
            content: theme
          }
        ]
      });
  
      res.json({ script: completion.data.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating script');
    }
  });