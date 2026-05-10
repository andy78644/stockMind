import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = (process.env.GEMINI_API_KEY?.split(",") || [])
    .map((k) => k.trim())
    .filter(Boolean);
let currentKeyIndex = 0;

function getGeminiClient() {
    if (apiKeys.length === 0) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return new GoogleGenerativeAI(key);
}

function getGeminiClientAt(index: number) {
    if (apiKeys.length === 0) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    return new GoogleGenerativeAI(apiKeys[index % apiKeys.length]);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Pull the first balanced {...} block out of a Gemini response. Handles
// preambles, trailing prose, and grounding citations injected by googleSearch.
function extractJsonObject(raw: string): string | null {
    const text = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "");
    const start = text.indexOf("{");
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === "\\") {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) return text.slice(start, i + 1);
        }
    }
    return null;
}

export async function generateDailyReport(tagName: string, catalysts: string[]) {
    const genAI = getGeminiClient();
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
        : "No specific user-defined catalysts.";

    const prompt = `
Role: Senior Equity Research Analyst.
Context: Daily News Briefing for "${tagName}".
Date: ${new Date().toISOString().split("T")[0]}

**Objective**:
Scan the last 24-48 hours of news for MATERIAL updates. Ignore noise. Focus on what moves the needle.

**Input Data**:
- Target: "${tagName}"
- Watchlist Catalysts: ${catalystList}

**Operational Rules**:
1. **Language**: Internal reasoning in English. **FINAL OUTPUT MUST BE IN TRADITIONAL CHINESE**.
2. **Filtering**: Only report news that impacts financials, sentiment, or the thesis.
3. **Citations**: **ALWAYS** use Markdown format \`[Title](URL)\` for links. Never show raw URLs.

**Output Format (Markdown)**:
## 每日重點速覽
[Summary of top 2-3 material stories with citation]

## 催化劑動態 (Catalyst Update)
- **[Catalyst Name]**: [Status Update or "No News"]

## 參考來源
- [Title](URL)
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini Generation Error:", error.message || error);
        throw error;
    }
}

export async function generateOverallAnalysis(tagName: string, catalysts: string[]) {
    const genAI = getGeminiClient();
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
        : "No specific user-defined catalysts.";

    const prompt = `
Role: Senior Equity Research Analyst (Top-Tier Investment Bank perspective).
Task: Analyze the target "${tagName}" as of ${new Date().toISOString().split("T")[0]}.

**Input Data:**
- Target: "${tagName}"
- User-Watched Catalysts: ${catalystList}

**Operational Rules:**
1. **Language**: The internal reasoning can be in English, but the **FINAL OUTPUT MUST BE IN TRADITIONAL CHINESE (Taiwan Professional Finance Terminology)**.
2. **Entity Detection**: First, determine if "${tagName}" is a specific Company or an Industry/Sector.
   - If **Company**: Focus on Financials, Valuation, Moat.
   - If **Industry**: Focus on TAM (Total Addressable Market), CAGR, Regulatory Trends.
3. **Citations**: **ALWAYS** use Markdown format \`[Title](URL)\` for all links. Never show raw URLs.

**Analysis Requirements (Deep Dive):**

1. **Executive Summary**:
   - Give a clear Bullish/Bearish/Neutral rating.
   - Summarize the "One Thing" that matters most right now.

2. **Fundamental & Financial Health (CRITICAL)**:
   - **Metrics**: detailed Revenue, Margins (Gross/Operating), FCF (Free Cash Flow).
   - **Valuation**: Is it cheap or expensive historicaly? (P/E, P/S, EV/EBITDA).
   - **Balance Sheet**: Debt levels, Cash position.

3. **Catalyst & Driver Analysis**:
   - **Review User's List**: Analyze the "User-Watched Catalysts" provided above.
   - **DISCOVER NEW CATALYSTS**: Identify 2-3 *hidden* or *upcoming* catalysts that the user did NOT mention but should be watching (e.g., upcoming product launches, regulatory changes, competitor failure).

4. **Competitive Moat & Risks**:
   - Why do they win? (Network effect, Cost advantage, Switching costs).
   - What kills the thesis? (Bear case).

**Output Format (Markdown)**:
## 投資觀點摘要 (Investment Thesis)
[Comprehensive summary]

## 基本面深度分析 (Fundamentals)
[Data-rich analysis with specific numbers]

## 關鍵催化劑追蹤 (Catalysts)
### 用戶關注列表：
- **[Catalyst]**: [Analysis]

### 分析師新增關注 (New Opportunities)：
- **[New Catalyst 1]**: [Why it matters]
- **[New Catalyst 2]**: [Why it matters]

## 競爭優勢與風險 (Moat & Risks)
[Moat analysis and key risks]

## 參考來源
- [Title](URL)
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini Overall Analysis Error:", error.message || error);
        throw error;
    }
}

export async function generateTagAssessment(tagName: string, catalysts: string[]): Promise<{ points: string[], sentiment: string, summary: string }> {
    const catalystList = catalysts.length > 0
        ? catalysts.map((c) => `- ${c}`).join("\n")
        : "No specific catalysts";

    const prompt = `
Role: Senior Financial Analyst.
Task: Quick Sentiment Assessment for "${tagName}" over the last 24-48 hours.

**Rules**:
1. Output strictly in JSON. No prose before or after the JSON object.
2. Language: Traditional Chinese.
3. Sentiment Logic:
   - POSITIVE: Material good news (Earnings beat, Product launch, Upgrade).
   - NEGATIVE: Material bad news (Miss, Lawsuit, Downgrade).
   - NEUTRAL: Noise or mixed signals.

**Input**:
Target: ${tagName}
Catalysts: ${catalystList}

**Output JSON** (return ONLY this object, nothing else):
{
  "points": ["Point 1", "Point 2", "Point 3"],
  "sentiment": "POSITIVE",
  "summary": "One sentence summary"
}
`;

    // Retry across all available API keys with exponential backoff. Covers
    // transient Gemini errors (429/5xx), grounding-induced JSON corruption,
    // and per-key rate limits.
    const maxAttempts = Math.max(apiKeys.length, 1) * 2;
    let lastError: any;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const keyIndex = (currentKeyIndex + attempt) % Math.max(apiKeys.length, 1);
        try {
            const genAI = getGeminiClientAt(keyIndex);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                tools: [
                    {
                        googleSearch: {},
                    } as any,
                ],
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const raw = response.text();
            const json = extractJsonObject(raw);
            if (!json) {
                throw new Error(`No JSON object found in Gemini response for "${tagName}"`);
            }
            const parsed = JSON.parse(json);

            if (!Array.isArray(parsed.points) || typeof parsed.sentiment !== "string") {
                throw new Error(`Malformed assessment payload for "${tagName}"`);
            }
            // Advance the round-robin pointer so subsequent calls start fresh.
            currentKeyIndex = (keyIndex + 1) % Math.max(apiKeys.length, 1);
            return parsed;
        } catch (error: any) {
            lastError = error;
            const msg = error?.message || String(error);
            console.error(
                `Gemini Tag Assessment Error (attempt ${attempt + 1}/${maxAttempts}, key #${keyIndex}) for "${tagName}":`,
                msg
            );
            // Exponential backoff: 2s, 4s, 8s, capped at 16s. Skip after the last attempt.
            if (attempt < maxAttempts - 1) {
                await sleep(Math.min(16000, 2000 * 2 ** attempt));
            }
        }
    }

    throw lastError ?? new Error(`generateTagAssessment failed for "${tagName}"`);
}
