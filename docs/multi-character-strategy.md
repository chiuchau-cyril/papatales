# **multi-character-strategy.md**

## ** – 多角色一致性控制策略**

本文件說明如何在 AI 插圖生成流程中，確保故事中的多個角色在不同場景中維持風格與造型一致。適用於 PapaTales 等插圖故事書應用，並可延伸用於漫畫、動畫腳本或角色互動應用。

---

### **🎯 問題背景**

AI 圖像模型（如 DALL·E 或 SDXL）在單張生成時表現良好，但若故事有多段插圖、角色出現多次，常見問題包括：

* 同一角色在不同場景中外觀不一致
* AI 忽略角色細節（如髮色、配件）
* 較難生成多角色互動圖時保持辨識度

---

### **🧩 解法架構總覽**

```
flowchart TD
A[角色描述詞建構 (Character Prompt)] --> B[風格與特徵定義]
B --> C[角色形象參考圖生成]
C --> D[建立角色Embedding或Prompt片段]
D --> E[套用至故事每一段插圖 prompt 中]
E --> F[統一角色風格生成]
```

---

### **📌 步驟詳解**

#### **1. 建立角色設定（Character Definition）**

可使用 YAML/JSON 結構儲存，例如：

```
{
  "name": "三哥吉姆",
  "description": "一位冒失卻勇敢的青蛙冒險者，戴著紅色背包和圓眼鏡",
  "style": "水彩童話風",
  "keywords": ["green frog", "red backpack", "round glasses", "clumsy but brave"]
}
```

#### **2. 生成角色形象基準圖**

針對每個角色，使用描述語生成「角色定錨圖」（anchor image），並存為：

* jim_reference.png**（形象基準）**
* jim_pose1.png**, **jim_pose2.png**（多角度備用）**

#### **3. Prompt 標準化策略**

將角色提示詞模組化：

```
[角色提示片段] + [場景說明] + [風格提示] + [構圖語法]
```

例如：

> “a clumsy green frog named Jim wearing a red backpack and round glasses, standing in a magical forest, watercolor style, full body portrait”

#### **4. 角色提示詞注入策略**

* 每張 prompt 中強制加入該角色提示片段
* 多角色圖像時使用 layer prompt：
  * 主角放前面
  * 支援“left side”、“background”、“beside”作為結構詞

#### **5. 提供前端角色選單／風格 preview**

在 prompt 編輯器中支援：

* 快速插入角色描述片段
* 顯示角色代表圖供設計者參考
* 角色風格可「套用至全部段落插圖」

---

### **🔄 優化建議（進階應用）**

| **策略**         | **描述**                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| 使用 LoRA / IP Adapter | 如有支援 Stable Diffusion 可訓練微調角色樣貌                        |
| Character ID Prompt    | 用如“Jim the frog from scene 1”作為提示詞，強化 AI 的連續記憶意象 |
| 圖片內嵌 Reuse         | 前一段插圖裁切角色頭像，用於下一張提示圖參考                        |
| 評分機制               | 使用者針對一致性打分，建立 prompt 微調資料集                        |
