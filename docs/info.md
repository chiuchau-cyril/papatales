# **[papatales.ai](Papatales.ai) **自動產生繪本專案

實驗：~創作連續性的角色~

## 繪本創作規劃

* 小狼威利Remaster
* 記錄創作教學
* 創建AI協作創作Flow

# AI 繪本生成系統企劃書

Repo: [https://github.com/chiuchau-cyril/papatales](https://github.com/chiuchau-cyril/papatales)

## **Papatales.ai**

> Make your bedtime stories legendary.

## 🧠 專案簡介

本系統是一套 AI 驅動的繪本生產平台，使用者可輸入故事或交由 AI 協助創作劇本，並經由角色設定、美術風格挑選與插圖生成，自動產出 32 頁完整繪本，可輸出 PDF 或線上閱讀版本。系統整合 OpenAI 的 GPT 與 DALL·E API，讓創作流程自動化、模組化、可規模化。

### 競品

[https://magicalchildrensbook.com](https://magicalchildrensbook.com/examples)

---

## 📦 系統功能架構

### 1. 劇本與故事生成

* 支援使用者自行輸入故事或由 GPT 生成腳本
* 劇本會分為 32 頁，每頁具備：

  * 敘述文字
  * 插圖描述（scene description）
  * 插圖提示語（prompt）

### 2. 角色創建與一致性

* 每本書可定義多個角色，包含：

  * 姓名、種族、年齡、個性、外觀特徵
* 由 DALL·E 生成五視角圖片：

  * 正面／側面／背面／俯視／仰視

### 3. 美術風格設定

* 可挑選或自建美術風格：

  * 水彩 / 手繪 / 平面風等
* 每個風格包含：

  * 名稱、描述、參考圖、Prompt 前綴語

### 4. 插圖自動生成

* 每頁自動組合 prompt，送至 DALL·E API 生成圖片
* 系統儲存多張候選圖供使用者挑選

### 5. 匯出與出版

* 將 32 頁插圖與文字排版輸出為 PDF 或 HTML
* 可選擇發佈為線上繪本閱讀連結

---

## 🗂️ 資料結構（JSON/MongoDB 格式）

### storybook

```
{
  "id": "storybook_001",
  "title": "森林裡的小英雄",
  "description": "一個關於動物村莊勇敢小熊的故事",
  "language": "zh-TW",
  "page_count": 32,
  "art_style_id": "style_watercolor_01",
  "created_by": "user_123",
  "status": "draft"
}
```

## characters

```
{
  "id": "char_bear_tomo",
  "storybook_id": "storybook_001",
  "name": "Tomo",
  "species": "小熊",
  "age": 6,
  "personality": ["勇敢", "冒失", "喜歡幫助別人"],
  "visual_traits": {
    "fur_color": "brown",
    "accessories": ["紅色圍巾"],
    "clothes": "藍色吊帶褲"
  },
  "pose_images": {
    "front": "url_to_image_front.png",
    "side": "url_to_image_side.png",
    "back": "url_to_image_back.png",
    "top": "url_to_image_top.png",
    "bottom": "url_to_image_bottom.png"
  }
}
```

## pages

```
{
  "id": "page_01",
  "storybook_id": "storybook_001",
  "page_number": 1,
  "text": "在森林的深處，Tomo住在一棟溫暖的小木屋裡。",
  "scene_description": "Tomo wakes up in a cozy wooden house, morning light shining through the window.",
  "characters_in_scene": ["char_bear_tomo"],
  "illustration_prompt": "...",
  "final_image": "img_final_01.png"
}
```

## art_styles

```
{
  "id": "style_watercolor_01",
  "name": "溫柔水彩風",
  "description": "柔和筆觸、手繪水彩質感，適合童話類故事",
  "style_prompt_prefix": "in watercolor style, soft edges, pastel colors"
}
```

## 🧾 Prompt 範例（DALL·E 專用）

角色：Tomo（正面）

> A cartoon-style character design of a cute brown bear cub named Tomo. He is 6 years old, wearing blue overalls and a red scarf, with big round eyes and a friendly smile. Please draw the character in a front-facing view, in a watercolor illustration style. Transparent background.

插圖：第1頁

> A cozy wooden cabin interior at sunrise. Inside, a cute cartoon bear cub named Tomo is stretching in bed with a big yawn. Sunlight shines through the window. Style: watercolor illustration with pastel colors and soft lines.

## 🧩 Backend API 架構設計

本系統提供 RESTful API 接口，協助前端串接故事、角色、插圖、自動產圖與出版功能。

---

### 📘 Storybooks（繪本管理）

* `GET /api/storybooks`
  取得使用者的所有繪本列表
* `POST /api/storybooks`
  建立新繪本（需包含標題與描述）
* `GET /api/storybooks/:id`
  查詢某本繪本的詳細資料
* `PUT /api/storybooks/:id`
  編輯繪本基本資訊（標題、風格、語言等）
* `DELETE /api/storybooks/:id`
  刪除整本繪本

---

### 📄 Pages（頁面與劇情腳本）

* `POST /api/storybooks/:id/script/ai-generate`
  使用 GPT 產出整本書的 32 頁分頁劇情與分鏡描述
* `GET /api/storybooks/:id/pages`
  取得所有頁面的腳本與插圖資訊
* `PUT /api/pages/:pageId`
  編輯單頁的文字敘述或插圖提示

---

### 👤 Characters（角色管理與圖像生成）

* `POST /api/storybooks/:id/characters`
  建立新角色（輸入角色個性與外觀）
* `GET /api/storybooks/:id/characters`
  取得此繪本的所有角色列表
* `PUT /api/characters/:id`
  編輯角色資訊（如修改髮型或個性）
* `POST /api/characters/:id/generate-images`
  使用 DALL·E 生成角色五視角圖像

---

### 🖼️ Illustrations（插圖生成與管理）

* `POST /api/pages/:pageId/generate-illustration`
  根據該頁的 prompt，自動送出 DALL·E 請求生成插圖
* `POST /api/pages/:pageId/regenerate`
  重新生成圖片（若不滿意先前結果）
* `GET /api/pages/:pageId/images`
  查看此頁候選圖、最終圖的 URL 清單
* `PUT /api/pages/:pageId/final-image`
  設定最終使用插圖

---

### 🎨 Styles（風格設定）

* `GET /api/styles`
  查看所有可用的美術風格模板
* `POST /api/storybooks/:id/set-style`
  指定某本繪本使用的繪圖風格

---

### 📤 Output / Export（匯出與發佈）

* `GET /api/storybooks/:id/export/pdf`
  將整本書輸出為 PDF 格式（含圖＋文）
* `GET /api/storybooks/:id/export/html`
  輸出為可嵌入前端瀏覽器的繪本閱讀器格式
* `POST /api/storybooks/:id/publish`
  發佈此書為公開可閱覽作品

---

## 🧠 Prompt 組合模組（Illustration Prompt Generator）

### 🎯 目標

依照每頁的劇情內容、角色出場、畫面構圖與風格設定，自動組合高品質、適用於 DALL·E API 的插圖提示語（Prompt）。

---

### 🧩 Prompt 組合邏輯架構

Final Prompt = [場景描述] + [角色描述] + [構圖視角] + [風格提示]

---

### 📘 基本欄位說明

| 欄位                        | 說明                                                   |
| --------------------------- | ------------------------------------------------------ |
| `scene_description`       | 每頁的背景與情節簡述（如：Tomo 在森林裡追蝴蝶）        |
| `characters_in_scene`     | 出場角色清單（含動作、情緒）                           |
| `camera_angle`            | 鏡頭角度（如：wide shot, close-up, top-down）          |
| `art_style.prompt_prefix` | 美術風格語句（如：`watercolor style, pastel tones`） |

---

### 🧾 Prompt 組合公式（英文）

[scene_description]. In the scene, [character_description_sentence(s)].

[Optional camera_angle or layout hint].

Style: [art_style.prompt_prefix].

---

### 🧪 範例：第 3 頁插圖 Prompt 組合

#### 🔹 來源資料：

* `scene_description`:
  `Tomo is chasing butterflies in a sunny forest clearing.`
* `characters_in_scene`:
  `Tomo looks excited and is running with arms outstretched.`
* `camera_angle`:
  `wide shot`
* `art_style.prompt_prefix`:
  `watercolor style, soft lines, pastel colors`

#### 🔹 組合結果：

Tomo is chasing butterflies in a sunny forest clearing. In the scene, Tomo looks excited and is running with arms outstretched. Wide shot. Style: watercolor style, soft lines, pastel colors.

---

### 🛠️ JavaScript Prompt 組合邏輯（Node.js / TypeScript）

```
function generateIllustrationPrompt(page, characters, style) {
  const scene = page.scene_description;
  const characterLines = page.characters_in_scene.map(charId => {
    const char = characters.find(c => c.id === charId);
    return `${char.name} looks ${char.emotion || 'happy'} and is ${char.action || 'standing in the scene'}`;
  }).join(" ");

  const camera = page.layout_hint?.camera_angle ? `${page.layout_hint.camera_angle}.` : '';
  const styleLine = `Style: ${style.prompt_prefix}.`;

  return `${scene} In the scene, ${characterLines} ${camera} ${styleLine}`;
}
```

## 動作與表情詞彙表

建立角色動作／情緒語彙字典供程式引用

# 🎭 動作與表情詞彙表（Actions & Emotions Vocabulary）

本詞彙表提供繪本角色在插圖生成時可用的動作與情緒對應詞，供系統組合角色描述句時使用，提升 prompt 的語意準確度與插圖穩定性。

---

## 😊 表情（Emotions）

| 中文情緒 | 英文描述語句                      |
| -------- | --------------------------------- |
| 快樂     | smiling happily                   |
| 興奮     | looking excited                   |
| 害羞     | blushing slightly                 |
| 傷心     | looking sad with teary eyes       |
| 生氣     | frowning with anger               |
| 驚訝     | wide-eyed with surprise           |
| 疲憊     | looking tired with droopy eyes    |
| 緊張     | looking nervous, eyes shifting    |
| 專注     | focused expression                |
| 害怕     | scared expression, covering mouth |

---

## 🏃 動作（Actions）

| 中文動作 | 英文描述語句                  |
| -------- | ----------------------------- |
| 站立     | standing calmly               |
| 坐下     | sitting with legs crossed     |
| 奔跑     | running quickly               |
| 跳躍     | jumping with joy              |
| 揮手     | waving with one hand          |
| 擁抱     | reaching out for a hug        |
| 躺下     | lying on the ground           |
| 看書     | reading a book                |
| 看遠方   | gazing into the distance      |
| 舉手     | raising one hand              |
| 指東西   | pointing at something         |
| 探頭     | peeking from behind an object |
| 張開雙臂 | arms outstretched             |
| 打哈欠   | yawning with eyes closed      |

---

## 🧩 組合範例

### 輸入資料：

* 角色：Tomo
* 情緒：驚訝
* 動作：探頭

### 組合句建議：

```
Tomo looks wide-eyed with surprise and is peeking from behind a tree.
```

## 多角色同框控制

避免 DALL·E 將多角色融合或錯配，加入明確定位語句

# 👥 多角色同框控制策略（Multi-Character Scene Prompt Guide）

在使用 DALL·E API 生成插圖時，若同一畫面中出現多位角色，常見問題包括角色臉孔融合、造型錯亂、位置錯置。為避免此問題，建議遵守以下 prompt 編寫策略。

---

## 🧱 原則一：每位角色皆要獨立描述

避免用 "two bears"、"some animals" 等模糊詞，應逐一列出角色名與特徵。

✅ 建議格式：

Tomo the bear is standing on the left, waving. Luna the rabbit is sitting on a rock on the right, smiling shyly.

---

## 📍 原則二：指定角色位置／相對關係

提示中加入空間方位（left, right, in front of, next to）或動作相對性，協助 DALL·E 正確定位角色。

✅ 建議語句：

* "on the left / on the right"
* "standing beside / behind / next to"
* "in front of a tree / on top of a hill"

---

## 🧍‍♀️ 原則三：造型特徵不可省略

在每位角色後面簡單補上獨特外觀，以幫助模型區分人物。

✅ 範例：

Tomo, a small brown bear with a red scarf. Luna, a white rabbit with pink ears and a blue dress.

---

## 🎯 Prompt 組合範本（含 2 角色）

```
Tomo, a small brown bear with a red scarf and blue overalls, is standing on the left, waving happily. Luna, a white rabbit with long pink ears and a blue dress, is sitting on a rock on the right, smiling gently. They are in a sunny forest clearing with butterflies flying around. Style: watercolor, pastel tones, soft lines.
```

## Prompt 預覽與生成工具介面

提供前端顯示每頁 prompt + 一鍵生成圖片按鈕

# 🖼️ Prompt 預覽與生成工具介面（Prompt Preview & Generation UI）

本介面用於預覽並管理每一頁繪本的插圖生成提示語（Prompt），協助使用者理解圖像生成內容、微調描述、並一鍵產出插圖。

---

## 🎯 功能目標

* 顯示每一頁的插圖描述、角色資訊與最終生成的 Prompt
* 提供 prompt 微調區塊與立即重生圖片功能
* 顯示候選圖像與「設為最終圖」的選擇功能

---

## 🧱 介面區塊說明

### 1️⃣ 頁面選擇區

* 以橫向分頁或選單列出 1～32 頁
* 點擊頁碼可切換顯示當前頁內容

---

### 2️⃣ Prompt 構成區塊

顯示各組成欄位，供使用者微調（可直接編輯）

| 欄位               | 說明                                      |
| ------------------ | ----------------------------------------- |
| 📖 故事情境        | 來自 `scene_description`                |
| 👤 出場角色        | 含角色名稱、動作、表情                    |
| 🎥 視角設定        | 如：wide shot, close-up                   |
| 🎨 風格前綴        | 來自選定的 `art_style.prompt_prefix`    |
| 🧠 最終組合 Prompt | 自動生成的完整英文 prompt（可複製或微調） |

---

### 3️⃣ 圖像生成與預覽區

* 🔘 `重新生成插圖` 按鈕

  * 使用目前 prompt 向 DALL·E API 發送請求
* 🖼️ 圖像候選卡片區

  * 顯示目前頁面所有候選插圖（含生成時間）
  * 每張圖有「設為最終插圖」按鈕
  * 可加入「重命名圖像」或「刪除圖像」功能

---

### 4️⃣ 狀態與提示

* 生成中顯示 Spinner +「正在與 AI 繪圖中...」
* 錯誤提示如：

  * Prompt 格式錯誤
  * API 請求失敗
* 成功則顯示：「圖片已產出，可從候選中選擇」

---

## 📐 UI Layout 建議（可用 React 實作）

```
+----------------------------------------------------+
| [1] 頁面選擇列 [1] [2] [3] ... [32]                |
+----------------------------------------------------+
| [2] Prompt 編輯區                                  |
| - 場景敘述欄                                       |
| - 角色出場欄                                       |
| - 視角設定欄                                       |
| - 風格設定欄                                       |
| - 最終組合 Prompt 顯示框（可複製）               |
| - 重新生成插圖 按鈕                                |
+----------------------------------------------------+
| [3] 插圖候選預覽區                                 |
| - 每張圖卡片含「設為最終」、「刪除」              |
+----------------------------------------------------+
```

## 實作

1. /script

```
curl -X POST http://localhost:3000/predict/script \
-H "Content-Type: application/json" \
-d '{"theme": "一隻想飛的小豬"}'
```

 **第一頁** \n\n1）中文敘述：小豬佩奇一直夢想能像鳥一樣在藍天飛翔。他羨慕著飛鳥一展翅膀便能飛上雲端，每天都望著天空幻想自己快樂地飛翔。\n\n2）插圖描述（英文）：Illustration of a cute little pig named Peppa staring longingly at the blue sky. Birds fly freely across the horizon, their bright colors standing out against the sky. \n\n **第二頁** \n\n1）中文敘述：不願放棄夢想的小豬佩奇決定，他要試著自己製作翅膀。他四處收集能造翅膀的東西，用葉子、紙張、枝椏，甚至把媽媽的羽毛掃也拿來用。\n\n2）插圖描述（英文）：An image of Peppa is seen frantically gathering materials around him—a pile of leaves, several sheets of paper, twigs, and even a feather duster secretly taken from his mother's collection. He is focused on his task, a determined look on his face.\n\n **第三頁** \n\n1）中文敘述：經過一番努力，小豬佩奇做出了自己的翅膀。他急不及待的跑到山坡，展開翅膀嘗試飛翔。儘管第一次沒能飛起來，小豬佩奇的臉上依然洋溢著歡笑與希望。\n\n2）插圖描述（英文）: An illustration displaying Peppa proudly wearing his DIY wings, standing on a small hill. A gust of wind blows, sending some of the leaves from his wings into the air. Even though he's unable to fly, his face is full of laughter and hope—he's not about to give up on his dream to fly.

1. /image

```
curl -X POST http://localhost:3000/predict/image \
-H "Content-Type: application/json" \
-d '{"prompt": "A flying pig with wings in the sky, watercolor style, soft colors"}'
```

```
{"imageUrl":"https://oaidalleapiprodscus.blob.core.windows.net/private/org-0j10XDopEOXFjhLa062pmQQd/user-c3nGXQwyLX2pXX88z2NSAPAF/img-hSAWSl5nSxbNnE5GUEQFYy1O.png?st=2025-05-01T16%3A02%3A34Z&se=2025-05-01T18%3A02%3A34Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=475fd488-6c59-44a5-9aa9-31c4db451bea&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-01T02%3A10%3A34Z&ske=2025-05-02T02%3A10%3A34Z&sks=b&skv=2024-08-04&sig=zZRD1lkJwiYiZtZjC8vXzC4X2tQjoUtkfD2J9vSaIs4%3D"}%   
```

![]()
