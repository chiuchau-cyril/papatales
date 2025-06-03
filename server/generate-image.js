// 🖼️ 使用 DALL·E 產出圖片
app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;
  
    try {
      const imageResp = await openai.createImage({
        prompt,
        n: 1,
        size: '1024x1024' // 你可以改為 '512x512' 節省成本
      });
  
      res.json({ imageUrl: imageResp.data.data[0].url });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating image');
    }
  });