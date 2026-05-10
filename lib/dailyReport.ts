import { prisma } from "./db";
import { generateTagAssessment } from "./gemini";

export type Assessment = {
    name: string;
    points: string[];
    sentiment: string;
    summary: string;
};

export type Failure = {
    name: string;
    reason: string;
};

export type UserWithTags = {
    id: string;
    email: string | null;
    tags: Array<{
        id: string;
        name: string;
        catalysts: Array<{ content: string }>;
    }>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Process every tag for one user. Each tag is independent: a failure on one
// must NOT block the others, and the caller must be able to see which ones
// failed so we can surface them in the email.
export async function processUserAssessments(
    user: UserWithTags,
    options: { delayMs?: number; logger?: (msg: string) => void } = {}
): Promise<{ assessments: Assessment[]; failures: Failure[] }> {
    const delayMs = options.delayMs ?? 4000;
    const log = options.logger ?? ((msg) => console.log(msg));

    const assessments: Assessment[] = [];
    const failures: Failure[] = [];

    for (const tag of user.tags) {
        try {
            log(`  - Analyzing: ${tag.name}...`);
            const catalysts = tag.catalysts.map((c) => c.content);
            const assessment = await generateTagAssessment(tag.name, catalysts);

            await prisma.tagAssessment.create({
                data: {
                    tagId: tag.id,
                    points: assessment.points,
                    sentiment: assessment.sentiment,
                    summary: assessment.summary,
                },
            });

            assessments.push({ ...assessment, name: tag.name });
            log(`  - Done: ${tag.name} (${assessment.sentiment})`);
        } catch (error: any) {
            const reason = error?.message || String(error);
            console.error(`  - FAILED: ${tag.name} -`, reason);
            failures.push({ name: tag.name, reason });
        }

        if (delayMs > 0) await sleep(delayMs);
    }

    return { assessments, failures };
}

function getColor(sentiment: string) {
    if (sentiment === "POSITIVE") return "#22c55e";
    if (sentiment === "NEGATIVE") return "#ef4444";
    return "#9ca3af";
}

function translateSentiment(sentiment: string) {
    if (sentiment === "POSITIVE") return "看多";
    if (sentiment === "NEGATIVE") return "看空";
    return "中立";
}

function escapeHtml(input: string) {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function generateEmailHtml(
    assessments: Assessment[],
    failures: Failure[] = []
) {
    const failureBlock = failures.length
        ? `
        <div class="card" style="border-left: 5px solid #f59e0b; background: #fffbeb;">
            <div class="title-row">
                <span class="company">⚠️ 未完成分析</span>
                <span class="badge neutral">${failures.length} 家</span>
            </div>
            <div class="summary">以下標的本次分析失敗，建議稍後手動於 Dashboard 重新執行：</div>
            <ul>
                ${failures
                    .map(
                        (f) =>
                            `<li><strong>${escapeHtml(f.name)}</strong>：${escapeHtml(f.reason)}</li>`
                    )
                    .join("")}
            </ul>
        </div>
        `
        : "";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f3f4f6; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: #111827; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; padding: 15px; }
            .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .company { font-size: 1.25rem; font-weight: bold; color: #111827; }
            .badge { padding: 4px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
            .positive { background: #dcfce7; color: #166534; }
            .negative { background: #fee2e2; color: #991b1b; }
            .neutral { background: #f3f4f6; color: #374151; }
            .summary { color: #4b5563; font-style: italic; margin-bottom: 10px; }
            ul { margin: 0; padding-left: 20px; color: #374151; }
            li { margin-bottom: 4px; }
            .footer { text-align: center; font-size: 0.75rem; color: #6b7280; padding: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>每日投資速報</h2>
                <p>${new Date().toLocaleDateString("zh-TW")}</p>
            </div>
            <div class="content">
                ${assessments
                    .map(
                        (item) => `
                    <div class="card" style="border-left: 5px solid ${getColor(item.sentiment)}">
                        <div class="title-row">
                            <span class="company">${escapeHtml(item.name)}</span>
                            <span class="badge ${item.sentiment.toLowerCase()}">${translateSentiment(item.sentiment)}</span>
                        </div>
                        <div class="summary">"${escapeHtml(item.summary || "")}"</div>
                        <ul>
                            ${item.points.map((p: string) => `<li>${escapeHtml(p)}</li>`).join("")}
                        </ul>
                    </div>
                `
                    )
                    .join("")}
                ${failureBlock}
            </div>
            <div class="footer">
                <p>StockMind AI Daily Report</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
