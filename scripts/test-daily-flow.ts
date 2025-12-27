
import "dotenv/config";
import { prisma } from "../lib/db";
import { generateTagAssessment } from "../lib/gemini";
import { sendDailyReportEmail } from "../lib/email";

// Duplicate of the helper from the route
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
                <h2>每日投資速報 (測試版)</h2>
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
    console.log("Starting test run for daily report flow (Limited to 2 companies)...");

    // Get the first user
    const user = await prisma.user.findFirst({
        where: {
            email: { not: undefined },
            tags: { some: {} } // Must have tags
        },
        include: {
            tags: {
                take: 2, // LIMIT TO 2 TAGS
                include: { catalysts: true },
            },
        },
    });

    if (!user || !user.email) {
        console.error("No suitable user found (must have email and tags).");
        return;
    }

    console.log(`Testing for user: ${user.email}`);
    console.log(`Processing ${user.tags.length} tags: ${user.tags.map(t => t.name).join(", ")}`);

    const assessmentsData = [];

    for (const tag of user.tags) {
        try {
            console.log(`Analysis started for: ${tag.name}`);
            const catalysts = tag.catalysts.map((c) => c.content);
            const assessment = await generateTagAssessment(tag.name, catalysts);
            console.log(`Analysis complete for: ${tag.name} (Sentiment: ${assessment.sentiment})`);

            // Save to DB (so we can verify in Dashboard too)
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

            await delay(2000); // Short delay for test
        } catch (error) {
            console.error(`Error processing ${tag.name}:`, error);
        }
    }

    if (assessmentsData.length > 0) {
        console.log("Generating email HTML...");
        const htmlContent = generateEmailHtml(assessmentsData);

        console.log(`Sending email to ${user.email}...`);
        await sendDailyReportEmail(user.email, htmlContent);
        console.log("Email sent!");
    } else {
        console.log("No assessments generated, skipping email.");
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
