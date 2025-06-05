# **prompt-preview-ui.md**

## ** – 插圖生成介面設計**

此文件說明 PapaTales 專案中「插圖預覽與生成」功能的使用者介面設計與互動流程，目標是讓使用者可以針對每一段故事文字產出對應圖像，並可預覽、修改或重新生成。

---

### **🧩 元件組成一覽**

| **元件名稱**   | **功能說明**                                   |
| -------------------- | ---------------------------------------------------- |
| StorySegmentCard     | 顯示每段故事文字、並搭配一張插圖                     |
| PromptEditorModal    | 使用者可調整插圖 prompt 的彈窗                       |
| IllustrationCanvas   | 顯示插圖生成進度、支援 retry 或 upscale              |
| PromptLogPanel       | 顯示 prompt 歷史紀錄與圖像版本切換                   |
| StyleSelectorToolbar | 可選擇風格（如水彩、像素風、童話風）影響 prompt 結果 |

---

### **🖼️ 使用者流程（User Flow）**

```
graph TD
A[選擇故事] --> B[載入每段故事文字與預設 prompt]
B --> C[逐段顯示 StorySegmentCard]
C --> D{是否需要修改 prompt？}
D -- 是 --> E[打開 PromptEditorModal 編輯提示詞]
D -- 否 --> F[送出生成請求]
F --> G[插圖生成中 IllustrationCanvas 顯示中]
G --> H[成功生成插圖]
H --> I{是否滿意結果？}
I -- 否 --> E
I -- 是 --> J[保存圖像與 prompt]
```

---

### **📐 PromptEditorModal UI 設計**

| **欄位** | **類型** | **說明**                        |
| -------------- | -------------- | ------------------------------------- |
| 原始故事段落   | readonly       | 系統自動顯示當前段落內容              |
| 建議提示詞     | text           | 系統生成的 prompt，使用者可修改       |
| 圖像風格選擇   | select         | 如：水彩、鉛筆、像素、油畫            |
| 語言設定       | select         | 可選 English / 中文（影響提示詞語言） |
| 生成按鈕       | button         | 提交 prompt 給後端                    |
| 預覽區域       | image          | 顯示生成中或結果圖像                  |

---

### **💡 額外建議**

* 圖像儲存路徑應綁定 story ID + 段落編號 + version hash，例如：**story_abc123/seg02_v1.png**
* 可支援「風格套用到所有段落」的快捷鍵（style lock）
* 記錄使用者微調的 prompt，有助未來做 prompt fine-tuning 或自動化建議
