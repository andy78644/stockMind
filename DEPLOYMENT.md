# 🚀 Vercel 部署指南 (Supabase PostgreSQL 版本)

本專案已優化為支援 **Prisma 7** 與 **Supabase PostgreSQL**。

## 1. 準備 Supabase 資料庫

1.  在 [Supabase](https://supabase.com/) 建立專案。
2.  前往 **Project Settings -> Database** 取得 **Connection string** (URI 格式)。
3.  **如果您想使用自訂 Schema (例如 `StockMind`)**：
    *   在 Supabase 的 **SQL Editor** 執行：`CREATE SCHEMA IF NOT EXISTS "StockMind";`

## 2. 設定環境變數 (Vercel)

在 Vercel 專案設定中，添加以下環境變數：

| 變數名稱 | 說明 | 範例 |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase 連線字串 | `postgresql://user:pass@host:5432/postgres` |
| `DATABASE_SCHEMA` | 您要使用的 Schema 名稱 | `StockMind` |
| `AUTH_SECRET` | NextAuth 密鑰 | 使用 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | 部署後的網址 | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API Key | `...` |

## 3. Prisma 配置說明 (Prisma 7 重要變更)

為了在同一個資料庫中隔離不同專案的資料，我們採用了 Prisma 的官方 **Multi-Schema** 支援。

### 步驟 A: 修改 `schema.prisma`
當您要新增資料表或修改結構時，請確保 `schema.prisma` 包含以下配置：
```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["StockMind"] // 這裡要與環境變數一致
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model YourModel {
  ...
  @@schema("StockMind") // 每個 model 都必須標記 schema
}
```

### 步驟 B: 設定 `prisma.config.ts`
Prisma 7 要求連線配置必須在 `prisma.config.ts`：
```typescript
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
});
```

## 4. 部署步驟

1.  **推送到 GitHub**：
    我們已在 `package.json` 加入 `"postinstall": "prisma generate"`，Vercel 會自動產出正確的 Client。
2.  **推送 Schema 到 Supabase** (本地執行)：
    執行以下指令將資料結構同步到雲端：
    ```bash
    npx prisma db push
    ```
3.  **在 Vercel 部署**。

## 5. 常見問題 (FAQ)

*   **為什麼我在 Supabase 沒看到資料表？**
    請在 Supabase 的 Table Editor 頂部切換 Schema，從 `public` 切換到 `StockMind`。
*   **如何修改 Schema 名稱？**
    1. 修改 `.env` 與 Vercel 的 `DATABASE_SCHEMA`。
    2. 修改 `schema.prisma` 中的 `schemas` 列表與所有 `@@schema` 標記。
    3. 執行 `npx prisma generate`。
    4. 執行 `npx prisma db push`。

---

**完成以上步驟後，您的應用程式即可穩定運行於 Supabase 環境！**
