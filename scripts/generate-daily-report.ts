
import "dotenv/config";
import { prisma } from "../lib/db";
import { generateTagAssessment } from "../lib/gemini";
import { sendDailyReportEmail } from "../lib/email";

// Helper to duplicate HTML generation logic (shared with API)
function generateEmailHtml(assessments: any[]) {
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
                <p>${new Date().toLocaleDateString('zh-TW')}</p>
            </div>
            <div class="content">
                ${assessments.map(item => `
                    <div class="card" style="border-left: 5px solid ${getColor(item.sentiment)}">
                        <div class="title-row">
                            <span class="company">${item.name}</span>
                            <span class="badge ${item.sentiment.toLowerCase()}">${translateSentiment(item.sentiment)}</span>
                        </div>
                        <div class="summary">"${item.summary || ''}"</div>
                        <ul>
                            ${item.points.map((p: string) => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <div class="footer">
                <p>StockMind AI Daily Report</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getColor(sentiment: string) {
    if (sentiment === 'POSITIVE') return '#22c55e';
    if (sentiment === 'NEGATIVE') return '#ef4444';
    return '#9ca3af';
}

function translateSentiment(sentiment: string) {
    if (sentiment === 'POSITIVE') return '看多';
    if (sentiment === 'NEGATIVE') return '看空';
    return '中立';
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    console.log("Starting Daily Report Generation (CLI Mode)...");

    // Check Date to avoid running multiple times? (Optional, handled by schedule mostly)

    const users = await prisma.user.findMany({
        include: {
            tags: {
                include: { catalysts: true },
            },
        },
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (!user.email || user.tags.length === 0) continue;

        console.log(`Processing user: ${user.email}`);
        const assessmentsData = [];

        for (const tag of user.tags) {
            try {
                console.log(`  - Analyzing: ${tag.name}...`);
                const catalysts = tag.catalysts.map((c) => c.content);

                // Retry logic could be added here
                const assessment = await generateTagAssessment(tag.name, catalysts);

                // Save to DB
                await prisma.tagAssessment.create({
                    data: {
                        tagId: tag.id,
                        points: assessment.points,
                        sentiment: assessment.sentiment,
                        summary: assessment.summary,
                    },
                });

                assessmentsData.push({
                    ...assessment,
                    name: tag.name,
                });

                // Delay to respect rate limits
                await delay(4000);

            } catch (error) {
                console.error(`  - Error processing ${tag.name}:`, error);
            }
        }

        if (assessmentsData.length > 0) {
            console.log(`  - Sending email...`);
            await sendDailyReportEmail(user.email, generateEmailHtml(assessmentsData));
            console.log(`  - Email sent.`);
        }
    }

    console.log("Daily Report Generation Complete.");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
