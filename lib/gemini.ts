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
  
  輸出格式 (Markdown)：
  ## 每日總結
  [新聞總結]
  
  ## 催化劑影響分析
  - **[催化劑名稱]**: [影響評估，若無相關新聞則寫「無相關新聞」]
  
  參考來源： [若有搜尋結果，請列出來源]
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
