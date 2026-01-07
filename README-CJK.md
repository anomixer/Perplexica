# Perplexica 🔍 繁體中文版

[![GitHub Repo stars](https://img.shields.io/github/stars/ItzCrazyKns/Perplexica?style=social)](https://github.com/ItzCrazyKns/Perplexica/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ItzCrazyKns/Perplexica?style=social)](https://github.com/ItzCrazyKns/Perplexica/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ItzCrazyKns/Perplexica/blob/master/LICENSE)

Perplexica 是一個**注重隱私的 AI 問答引擎**，完全在您自己的硬體上運行。它結合了來自網際網路的知識，支援**本地 LLM**（Ollama）和雲端供應商（OpenAI、Claude、Groq），在保持搜尋完全私密的同時，提供準確的答案並**引用來源**。

![preview](.assets/perplexica-screenshot.png)

想了解更多關於其架構和運作原理？請閱讀[這裡](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/architecture/README.md)。

---

| 面向      | Perplexity（婆婆那個囍帖）                             | Perplexica （婆婆那個囍卡）                                                  |
| ------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| 性質定位    | 商業化的 AI 搜尋與問答服務，直接提供雲端平台給使用者使用。​      | 開源 AI 搜尋引擎專案，**本fork已與上游 (v1.12.1) 同步，並包含修改與優化（修正 theme 與 CJK 支援）**。​                  |
| 服務型態    | 線上 SaaS，使用者透過網站或 App 使用，不需自行維運。​      | 自架服務，由使用者自行在本機／伺服器部署與維護，可依需求調整設定與外觀。​                           |
| 開源狀態    | 本體非開源，屬於商業公司產品。​                      | 基於 GitHub 上的開源專案，本修改版仍延續開源性質，程式碼可檢視與再度修改。​                       |
| 主要功能    | 整合搜尋結果，產生摘要式、具引用來源的回答，支援多輪對話與各種主題查詢。 | 以「自架 AI 搜尋」為目標，整合 LLM 與智慧搜尋。**本 Fork 獨家支援 CJK 智慧分頁導出、核心引擎防崩潰機制與 Token 截斷保護。** |
| 使用門檻    | 一般使用者只要註冊即可使用，對技術要求較低。               | 偏向技術使用者。**本 Fork 已簡化配置流程，直接透過 UI 即可完成所有設定。**​               |
| 隱私與資料掌控 | 查詢與使用紀錄由服務提供商管理，依其隱私條款處理。​            | 可完全在自家環境運行。**新增穩定性邏輯，確保長網頁抓取時系統不崩潰，資料掌控更精確。**​                       |
| 收費模式    | 提供免費用量與付費進階方案（如更高配額與進階功能）。​           | 專案與修改本身免費，但需自備運算資源。**透過 Token 智慧截斷，能有效節省外部 API 的 Token 消耗。**                         |
| 使用情境    | 想直接用成熟的 AI 搜尋服務，不想處理系統與維運細節時。​        | 想要自控資料、客製外觀，且**需要極度穩定、支援大數據搜尋、且嚴格要求回答語言（繁中）**的場景。​              |


## 🌏 本地化修改說明

本版本已針對中文使用者進行以下優化：

### ✅ 已完成的修改

#### 1. **Dark Theme 深色主題修復**
- ✅ **從上游合併最新架構** - 已同步至 v1.12.1，包含新版介面與功能
- ✅ **完美支援系統模式** - 預設跟隨瀏覽器/系統設定（System Mode），無需手動切換
- ✅ **零閃爍體驗** - 針對 Next.js 16/15 優化了防閃爍腳本
- ✅ **設置持久化** - 若手動選擇主題，將會被記住

**修改文件：**
- `src/components/theme/Provider.tsx` - 主題提供者 (設為 System default)
- `src/app/layout.tsx` - 優化防閃爍腳本
- `src/lib/config/index.ts` - 配置更新

#### 2. **PDF 導出完整 CJK 支持** 📄
- ✅ **適配新版資料結構** - 已針對 v1.12+ 的新 Message/Section 架構重寫導出邏輯
- ✅ **完美支持繁體中文** (Traditional Chinese)
- ✅ **完美支持簡體中文** (Simplified Chinese)  
- ✅ **完美支持日文** (Japanese)
- ✅ **完美支持韓文** (Korean)
- ✅ **多語言字體配置** - 使用分語言字體，自動 fallback
- ✅ **智能字體檢測** - 自動檢測可用字體並註冊
- ✅ **靈活配置** - 可只安裝需要的語言字體
- ✅ **引用來源** - 自動包含在 PDF 中
- ✅ **Markdown 清理** - 自動移除格式標記

**修改文件：**
- `src/components/Navbar.tsx` - 重寫 `exportAsPDF` 函數 (適配新架構)

#### 3. **核心引擎穩定性與 CJK 強化** (本 Fork 特色) 🚀
- ✅ **語法錯誤防護 (Fail-safe)** - 修正了原版搜尋網址未設定時會導致程式崩潰的 Bug，現在會優雅地提示設定。
- ✅ **Token 爆炸防護 (Stability)** - 針對長網頁抓取進行了「智慧截斷」，防止搜尋結果過長導致 LLM 報錯 (`prompt too long`)。
- ✅ **絕對語言鎖定 (Enforcement)** - 徹底解決原版容易跳回英文回答的問題，這是在 Prompt 層級進行的深度鎖定。
- ✅ **環境配置簡化** - 全面採用 UI 設定加密儲存，無需手動編輯複雜的環境變數檔案，大幅提升易用性。

**修改文件：**
- `src/lib/searxng.ts` - 增加網址效驗與報錯處理
- `src/lib/agents/search/researcher/index.ts` - 增加對話歷史 Token 截斷邏輯
- `src/lib/prompts/search/writer.ts` - 實施最高優先級語言鎖定
- `src/lib/agents/search/classifier.ts` - 確保搜尋意圖改寫不偏離原始語言

**字體配置說明：**
- 使用集合語言字體（TC/SC/JP/KR），整合每種語言
- **智能字體切換**：自動檢測文本語言並切換字體

**使用方式：**
1. 進行對話
2. 點擊右上角分享按鈕（📤）
3. 選擇 "PDF"
4. 自動下載（支持所有 CJK 語言）

---

## 📦 CJK 字型安裝指南(使用 Source Han Sans TTF)

**Source Han Sans TTF(TrueType 版)完全相容 jsPDF**:

- ✔ 可嵌入
- ✔ 不會亂碼
- ✔ 支援繁中、簡中、日文、韓文

***

### 📥 下載 Source Han Sans TTF(思源黑體 TrueType 版本)

請從官方維護者 be5invis 提供的合併套件下載:

👉 **下載位置:**
https://github.com/be5invis/source-han-sans-ttf/releases/download/v2.002.1/source-han-sans-ttf-2.002.1.7z

內容包含:

```
SourceHanSans-Regular.ttf
SourceHanSans-Bold.ttf
```

這兩個字體是 **完整合併版**,支援所有 CJK 語系:

- 繁體中文
- 簡體中文
- 日本語
- 韓文

***

### 📁 安裝步驟

#### 1️⃣ 解壓縮 `.7z`

請使用 7-Zip 或 WinRAR 將 `source-han-sans-ttf-2.002.1.7z` 解壓縮。

解壓後會看到:

```
SourceHanSans-Regular.ttf
SourceHanSans-Bold.ttf
```


#### 2️⃣ 將兩個 `.ttf` 複製到:

```
public/fonts
```


#### 3️⃣ 確認目錄內容

```
public/fonts/SourceHanSans-Regular.ttf
public/fonts/SourceHanSans-Bold.ttf
```

**文件大小:** 每個約 15-20MB

***

### 🔧 PDF 導出設定(已更新 Navbar.tsx 使用 SourceHanSans)

程式現在會使用:

```ts
const cjkRegular = '/fonts/SourceHanSans-Regular.ttf';
const cjkBold = '/fonts/SourceHanSans-Bold.ttf';
```

並將 `fontName` 設為:

```
SourceHanSans
```

所有 CJK 內容(繁中/簡中/日文/韓文)都會正確輸出、不亂碼。

***

### 驗證安裝

安裝完成後,檢查 `public/fonts/` 目錄:

```powershell
cd Perplexica\public\fonts
ls
```

**應該看到:**

```
SourceHanSans-Regular.ttf      (~15-20MB)
SourceHanSans-Bold.ttf         (~15-20MB)
```


### 字型工作原理

1. **統一字型** - 使用 Source Han Sans 合併版,一個字型檔支援所有 CJK 語系
2. **自動嵌入** - jsPDF 會自動載入並嵌入字型到 PDF
3. **完美相容** - TrueType 格式確保完全相容 jsPDF
4. **零亂碼** - 不會出現方框字或亂碼問題
5. **性能優化** - 字型只在第一次導出時加載,之後使用緩存

***


## ✨ 功能特色

🤖 **支援所有主要 AI 供應商** - 通過 Ollama 使用本地 LLM，或連接到 OpenAI、Anthropic Claude、Google Gemini、Groq 等。根據您的需求混合搭配模型。

⚡ **智能搜尋模式** - 選擇平衡模式進行日常搜尋，需要快速答案時選擇快速模式，或等待品質模式（即將推出）進行深度研究。

🎯 **六種專業焦點模式** - 使用專為特定任務設計的模式獲得更好的結果：學術論文、YouTube 影片、Reddit 討論、Wolfram Alpha 計算、寫作協助或一般網路搜尋。

🔍 **由 SearxNG 驅動的網路搜尋** - 在保持身份隱私的同時訪問多個搜尋引擎。即將支援 Tavily 和 Exa 以獲得更好的結果。

📷 **圖片和影片搜尋** - 在文字結果旁邊尋找視覺內容。搜尋不再僅限於文章。

📄 **檔案上傳** - 上傳文件並詢問相關問題。PDF、文字檔案、圖片 - Perplexica 都能理解。

🌐 **搜尋特定網域** - 當您知道要查找的位置時，將搜尋限制在特定網站。非常適合技術文件或研究論文。

💡 **智能建議** - 在您輸入時獲得智能搜尋建議，幫助您制定更好的查詢。

📚 **探索** - 全天瀏覽有趣的文章和熱門內容。無需搜尋即可保持資訊更新。

🕒 **搜尋歷史** - 每次搜尋都會在本地保存，因此您可以隨時重溫您的發現。您的研究永遠不會丟失。

✨ **更多即將推出** - 我們正在根據社群反饋積極開發新功能。加入我們的 Discord 以幫助塑造 Perplexica 的未來！

---

## 📥 安裝方式

主要有兩種安裝 Perplexica 的方式 - 使用 Docker 和不使用 Docker。強烈建議使用 Docker。

### 使用 Docker 開始 (CJK 推薦版) 🆕

這是針對中文使用者優化的版本，已內建 **中文字型 (Source Han Sans)** 以及 **客製化 SearXNG**。

#### 🐳 Docker 版本差異對照

| 標籤 (Tag) | 名稱 | 內建 SearXNG | 適合對象 |
| :--- | :--- | :---: | :--- |
| `latest` | **Full (推薦)** | ✅ 有 | **懶人必備**。啟動後直接可用，不需額外架設搜尋伺服器。 |
| `slim` | **Slim** | ❌ 無 | **進階玩家**。需在介面手動設定 `SEARXNG_API_URL` 關聯外部服務。 |

```bash
docker run -d -p 3000:3000 \
  -v perplexica-data:/home/perplexica/data \
  -v perplexica-uploads:/home/perplexica/uploads \
  --name perplexica \
  ghcr.io/anomixer/perplexica:latest
```

**特色：**
- **內建字型**：支援繁、簡、日、韓 PDF 導出，不需手動安裝字型。
- **內建搜尋**：已內建並配置好 SearXNG (支援 JSON 查詢)。
- **引擎優化**：包含上述所有針對 CJK 語言鎖定與穩定性的修改。
- **即裝即蓋**：一行指令即可在任何支持 Docker 的環境（如 Debian, Ubuntu, Synology）運行。

---

### 🏘️ Synology NAS 安裝教學 (Container Manager)

對於使用群暉 NAS 的用戶，建議使用 **Container Manager** (原 Docker) 的「專案」功能進行部署。

#### 1. 準備資料夾 (⚠️ 必要步驟)
1. 開啟 **File Station**。
2. 進入 `docker` 共用資料夾。
3. 建立一個名為 `perplexica` 的資料夾。
4. **進入該資料夾，建立兩個空白資料夾：`data` 與 `uploads`。** (此為掛載資料卷所必需，請務必建立)

#### 2. 建立專案
1. 開啟 **Container Manager** 套件。
2. 點擊左側 **「專案 (Project)」** -> **「新增 (Create)」**。
3. 設定如下：
   - **專案名稱**: `perplexica`
   - **路徑**: 選擇剛剛建立的 `/docker/perplexica`。
   - **來源**: 選擇「建立 docker-compose.yml」。
4. 在編輯框貼上以下內容：

```yaml
version: '3'
services:
  perplexica:
    image: ghcr.io/anomixer/perplexica:latest
    container_name: perplexica
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/home/perplexica/data
      - ./uploads:/home/perplexica/uploads
```

#### 3. 啟動與更新
- 點擊「下一步」並勾選「完成後啟動專案」，點擊「完成」。
- 等待映像檔下載並啟動後，訪問 `http://<NAS_IP>:3000`。
- **日後更新**：在專案頁面點擊 `perplexica` -> 「動作」 -> 「重建 (Build)」(選取拉取映像檔) 即可。

---

### 使用 Docker 開始（原始專案，不支援CJK輸出）

如果您想使用官方原本的映像檔（注意：導出 PDF 會有亂碼）：

這將拉取並啟動帶有捆綁 SearxNG 搜尋引擎的 Perplexica 容器。運行後，打開瀏覽器並導航至 http://localhost:3000。然後您可以直接在設置畫面中配置您的設定（API 金鑰、模型等）。

**注意**：映像包含 Perplexica 和 SearxNG，因此不需要額外設置。`-v` 標誌為您的數據和上傳的檔案創建持久卷。

### 非 Docker 安裝 (可支援CJK字型輸出)

1. 安裝 SearXNG 並在 SearXNG 設定中允許 `JSON` 格式。確保也啟用了 Wolfram Alpha 搜尋引擎。
2. 克隆儲存庫：

   ```bash
   git clone https://github.com/anomixer/Perplexica.git
   cd Perplexica
   ```

3. 安裝依賴：

   ```bash
   npm i
   ```

4. 建構應用程式：

   ```bash
   npm run build
   ```

5. 安裝字型:

   參考上述作法，先下載字型檔

   ```bash
   wget https://github.com/be5invis/source-han-sans-ttf/releases/download/v2.002.1/source-han-sans-ttf-2.002.1.7z
   ```

   然後利用7-Zip或WinRAR解壓 .7z，並複製 SourceHanSans-Regular.ttf 和 SourceHanSans-Bold.ttf 至 public/fonts 目錄
   
   ```bash
   cp SourceHanSans-Regular.ttf  public/fonts
   cp SourceHanSans-Bold.ttf     public/fonts
   ```

6. 啟動應用程式：

   ```bash
   npm run start
   ```

7. 打開瀏覽器並導航至 http://localhost:3000 以完成設置並在設置畫面中配置您的設定（API 金鑰、模型、SearxNG URL 等）。

**注意**：使用 Docker 版本可簡化設置過程，特別是用於管理環境變數和依賴項。

---

## 🎯 使用方式

### Dark Theme 深色主題切換

1. 點擊左下角設定圖標 ⚙️
2. 選擇 "Preferences"
3. 在 "Theme" 下拉選單中選擇：
   - **Light** - 淺色主題
   - **Dark** - 深色主題  
   - **System** - 跟隨系統設置

### PDF 導出（完整 CJK 支持）

1. 進行對話
2. 點擊右上角分享按鈕（📤）
3. 選擇 "PDF"
4. 自動下載

**支援語言：**
- ✅ 繁體中文（Traditional Chinese）
- ✅ 簡體中文（Simplified Chinese）
- ✅ 日文（Japanese）
- ✅ 韓文（Korean）
- ✅ 英文（English）

**功能特色：**
- 自動偵測並使用 CJK 統一字體
- 如果沒有 CJK 字體，自動降級到繁體中文字體
- 智能分頁處理
- 包含引用來源
- Markdown 格式自動清理

---

## 🧪 測試驗證

### Dark Theme 測試

- [x] 瀏覽器設為 dark mode → 首次訪問 → 顯示 dark theme ✅
- [x] 瀏覽器設為 light mode → 首次訪問 → 顯示 light theme ✅
- [x] 切換主題 → 重新整理 → 保持選擇 ✅
- [x] System 模式 → 改變系統設置 → 自動切換 ✅
- [x] 無閃爍 ✅

### PDF 導出測試

- [x] 繁體中文對話 → 導出 → 正確顯示 ✅
- [x] 簡體中文對話 → 導出 → 正確顯示 ✅
- [x] 日文對話 → 導出 → 正確顯示 ✅
- [x] 韓文對話 → 導出 → **完美顯示** ✅ 🆕
- [x] 英文對話 → 導出 → 正確顯示 ✅
- [x] 混合語言 → 導出 → **智能切換字體** ✅ 🆕
- [x] 長對話 → 導出 → 自動分頁 ✅
- [x] 引用來源 → 導出 → 包含在 PDF ✅

**🆕 新功能：智能語言檢測**
- 自動檢測每行文本的語言
- 韓文、日文、簡中、繁中自動使用正確字體
- 混合語言內容完美處理

---


## 🤝 貢獻

Perplexica 建立在 AI 和大型語言模型應該讓每個人都容易使用的理念之上。如果您發現錯誤或有想法，請透過 GitHub Issues 分享。有關為 Perplexica 貢獻的更多資訊，您可以閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 文件以了解更多關於 Perplexica 以及如何為其做出貢獻。

---

## 📞 幫助與支援

如果您有任何問題或反饋，請隨時聯繫我們。您可以在 GitHub 上創建問題或加入我們的 Discord 伺服器。在那裡，您可以與其他用戶聯繫、分享您的經驗和評論，並獲得更個人化的幫助。[點擊這裡](https://discord.gg/EFwsmQDgAu)加入 Discord 伺服器。

感謝您探索 Perplexica，這個旨在增強您搜尋體驗的 AI 驅動搜尋引擎。我們正在不斷努力改進 Perplexica 並擴展其功能。我們重視您的反饋和貢獻，這有助於我們讓 Perplexica 變得更好。不要忘記回來查看更新和新功能！

---

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件。

---

**Made with ❤️ for the Chinese community | 為中文社群精心打造**
