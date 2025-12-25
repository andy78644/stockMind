# 🚀 Vercel 部署指南

由於專案使用了 Next.js, Prisma 以及 SQLite (透過 Turso/libSQL)，在部署到 Vercel 時需要特別注意資料庫的處理。

## 1. 準備資料庫 (Turso)

Vercel 是 Serverless 環境，不支援本地 `.db` 檔案。建議使用 **Turso** 提供雲端 SQLite 服務。

1.  安裝 Turso CLI 或前往 [Turso 官網](https://turso.tech/) 註冊。
2.  建立新的資料庫：`turso db create stock-info-db`
3.  取得連線資訊：
    *   **DATABASE_URL**: `libsql://your-db-name.turso.io`
    *   **DATABASE_AUTH_TOKEN**: (在 Turso 打開連線權杖)

## 2. 設定環境變數 (Environment Variables)

在 Vercel 專案設定中，添加以下環境變數：

| 變數名稱 | 說明 | 範例 |
| :--- | :--- | :--- |
| `DATABASE_URL` | Turso 資料庫連結 | `libsql://...` |
| `DATABASE_AUTH_TOKEN` | Turso 存取權杖 (選填，若連線需要) | `...` |
| `AUTH_SECRET` | NextAuth 密鑰 | 使用 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | 部署後的網址 | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API Key | `...` |

## 3. 修改資料庫連線 (lib/db.ts)

專案已經配置好支援 `libsql`。請確保 `lib/db.ts` 如下所示：

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(libsql);
export const prisma = new PrismaClient({ adapter });
```

*(註：目前程式碼已初步支持，部署前請確認 .env 已更新為 Turso 連結)*

## 4. 部署步驟

1.  將程式碼推送到 GitHub。
2.  在 Vercel 中匯入專案。
3.  設定上述環境變數。
4.  **重要**：在部署前，您需要先產出 Prisma Client。Vercel 會自動執行 `npm run build`，這會觸發 `prisma generate`。
5.  手動推送 Schema 到 Turso (本地執行一次)：
    ```bash
    DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npx prisma db push
    ```

---

## 選項 B：使用 Supabase (PostgreSQL)

如果您偏好使用 Supabase，請按照以下步驟操作：

### 1. 準備 Supabase
1.  在 [Supabase](https://supabase.com/) 建立專案。
2.  前往 **Project Settings -> Database** 取得 **Connection string** (URI 格式)。
    *   範例：`postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres`

### 2. 修改 Schema (Prisma 7+)
在新版 Prisma 7 中，`schema.prisma` 只負責定義 Provider，連線字串必須放在 `prisma.config.ts`：

**prisma/schema.prisma**:
```prisma
datasource db {
  provider = "postgresql"
}
```

**prisma.config.ts**:
```typescript
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-ignore
    directUrl: process.env.DIRECT_URL,
  },
});
```

### 3. 設定環境變數 (Vercel)
在 Vercel 中設定：
*   **DATABASE_URL**: (使用 Pooler 連線，Port 6543)
    範例：`postgres://postgres.xxxx:[password]@aws-0-xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true`
*   **DIRECT_URL**: (使用 Direct 連線，Port 5432)
    範例：`postgres://postgres.xxxx:[password]@aws-0-xxxx.pooler.supabase.com:5432/postgres`

> [!IMPORTANT]
> **為什麼要分兩個？**
> `npx prisma db push` (更改資料庫結構) 必須使用 **Direct URL**。
> 平常 App 運行建議使用 **DATABASE_URL (Pooler)** 以避免連線數過多。

### 4. 部署
1.  **推送 Schema 到 Supabase** (本地執行一次)：
    請務必使用 **Direct Connection** (Port 5432) 的連線字串：
    ```bash
    DIRECT_URL="你的 Direct 連線字串" npx prisma db push
    ```
    *(註：若 Free tier 沒有額外的 Direct URL，通常 Port 5432 就是 Direct 連線)*
2.  在 Vercel 部署。

---

## 💡 進階提示：在同一個 Supabase 專案跑多個專案？

**答案是肯定的！** 雖然 Supabase 免費版限制一個 Project，但一個 PostgreSQL 資料庫內可以建立多個 **Schema** (命名空間)。

### 設定方法：
1.  **修改連線字串**：
    在 `DATABASE_URL` 後面加上 `?schema=你的專案名`。
    *   專案 A：`postgresql://...@...:5432/postgres?schema=public`
    *   專案 B (本專案)：`postgresql://...@...:5432/postgres?schema=stockmind`
2.  **執行推送**：
    當您執行 `npx prisma db push` 時，Prisma 會自動在 Supabase 內建立該 Schema 以及對應的資料表。

### 優缺點：
*   **優點**：節省費用，共用一個 Supabase 實例。
*   **缺點**：共用資源 (CPU/RAM/儲存空間)；在 Supabase Dashboard 預設只會看到 `public` schema，切換其他 schema 需要在 SQL Editor 或 Table Editor 的下拉選單中手動選擇。

> [!TIP]
> 如果您希望每個專案完全獨立且不共用資源，**Turso** 是更好的選擇，因為它的免費版支援同時建立多個獨立資料庫。

---

## 5. 常見問題

*   **為什麼不能用 file:./dev.db？**
    Vercel 的檔案系統是唯讀且暫存的，重啟後資料會消失。
*   **Gemini API 報錯？**
    請確認 `GEMINI_API_KEY` 已在 Vercel 後台正確設定，且選用的模型 (如 `gemini-2.5-flash`) 在該 Key 的權限範圍內。

---

**完成以上步驟後，您的應用程式即可在全球穩定運行！**
