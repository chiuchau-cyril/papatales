require('dotenv').config();
const express = require('express');
const predictRoutes = require('./routes/predict');
const storyRoutes = require('./routes/story');

const app = express();
const port = process.env.PORT || 3000;

// 使用 JSON middleware
app.use(express.json());

// 使用預測相關的路由
app.use('/predict', predictRoutes);
app.use('/story', storyRoutes);

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器在 http://localhost:${port} 運行中...`);
});