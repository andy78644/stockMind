import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateDailyReport(tagName: string, catalysts: string[]) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash as requested by user to test availability.
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [
            {
                googleSearch: {},
            } as any,
        ],
    });

    const catalystList = catalysts.length > 0
        ? catalysts.map((c) => `- ${c}`).join("\n")
        : "無指定指標";

    const prompt = `
  你是一位專業的財經分析助手。請使用繁體中文（正體中文）進行回覆。
  
  目標對象： "${tagName}"
  今天是： ${new Date().toISOString().split("T")[0]}
  
  需要關注的催化劑/指標：
  ${catalystList}
  
  任務：
  1. 搜尋過去 24-48 小時內關於 "${tagName}" 的最新重要新聞、新聞稿或財務更新。
  2. 簡明扼要地總結關鍵資訊。
  3. 特別分析是否有任何新聞直接影響或提及上述「需要關注的催化劑/指標」。
  
  重要格式要求：
  - 所有連結必須使用 Markdown 格式：[新聞標題或描述性文字](URL)
  - 請勿直接顯示原始 URL，務必使用有意義的標題作為連結文字
  - 例如：[特斯拉Q4交付量創新高](https://example.com/news) 而非直接貼網址
  
  輸出格式 (Markdown)：
  ## 每日總結
  [新聞總結，包含格式化的來源連結]
  
  ## 催化劑影響分析
  - **[催化劑名稱]**: [影響評估，若無相關新聞則寫「無相關新聞」]
  
  ## 參考來源
  - [來源標題1](URL1)
  - [來源標題2](URL2)
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini Generation Error:", error.message || error);
        if (error.response?.candidates?.[0]?.finishReason === "SAFETY") {
            console.error("Safety block triggered");
        }
        throw error;
    }
}

export async function generateOverallAnalysis(tagName: string, catalysts: string[]) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [
            {
                googleSearch: {},
            } as any,
        ],
    });

    const catalystList = catalysts.length > 0
        ? catalysts.map((c) => `- ${c}`).join("\n")
        : "無指定指標";

    const prompt = `
  你是一位專業的財經分析助手。請使用繁體中文（正體中文）進行回覆。
  
  目標對象： "${tagName}"
  分析日期： ${new Date().toISOString().split("T")[0]}
  
  需要關注的催化劑/指標：
  ${catalystList}
  
  任務：
  這是一份**整體分析報告**，不同於每日新聞摘要。請提供深入且全面的分析：
  
  1. **基本面分析**：公司/產業的財務健康狀況、營收成長趨勢、獲利能力
  2. **競爭優勢**：護城河、市場地位、核心競爭力分析
  3. **產業趨勢**：所處產業的長期發展方向、市場規模變化
  4. **風險評估**：主要風險因素、潛在威脅
  5. **投資論點**：綜合以上分析，提出整體投資觀點
  
  重要格式要求：
  - 所有連結必須使用 Markdown 格式：[新聞標題或描述性文字](URL)
  - 請勿直接顯示原始 URL，務必使用有意義的標題作為連結文字
  
  輸出格式 (Markdown)：
  ## 整體分析摘要
  [簡短的投資觀點總結]
  
  ## 基本面分析
  [財務健康、營收、獲利分析]
  
  ## 競爭優勢分析
  [護城河、市場地位分析]
  
  ## 產業趨勢
  [長期產業發展方向]
  
  ## 風險評估
  - **風險1**: [說明]
  - **風險2**: [說明]
  
  ## 催化劑追蹤
  - **[催化劑名稱]**: [與整體投資論點的關聯性]
  
  ## 投資論點
  [綜合結論與建議]
  
  ## 參考來源
  - [來源標題1](URL1)
  - [來源標題2](URL2)
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini Overall Analysis Error:", error.message || error);
        if (error.response?.candidates?.[0]?.finishReason === "SAFETY") {
            console.error("Safety block triggered");
        }
        throw error;
    }
}
