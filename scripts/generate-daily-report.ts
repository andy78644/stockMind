import "dotenv/config";
import { prisma } from "../lib/db";
import { sendDailyReportEmail } from "../lib/email";
import { generateEmailHtml, processUserAssessments } from "../lib/dailyReport";

async function main() {
    console.log("Starting Daily Report Generation (CLI Mode)...");

    const users = await prisma.user.findMany({
        include: {
            tags: {
                include: { catalysts: true },
            },
        },
    });

    console.log(`Found ${users.length} users.`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const user of users) {
        if (!user.email || user.tags.length === 0) continue;

        console.log(`Processing user: ${user.email} (${user.tags.length} tags)`);
        const { assessments, failures } = await processUserAssessments(user);

        if (assessments.length === 0 && failures.length === 0) continue;

        const dateStr = new Date().toISOString().split("T")[0];
        const subject = failures.length
            ? `每日投資速報 (部分失敗 ${failures.length}) - ${dateStr}`
            : `每日投資速報 - ${dateStr}`;

        console.log(
            `  - Sending email (success: ${assessments.length}, failed: ${failures.length})...`
        );
        await sendDailyReportEmail(
            user.email,
            generateEmailHtml(assessments, failures),
            subject
        );
        console.log(`  - Email sent.`);

        totalSent += assessments.length;
        totalFailed += failures.length;
    }

    console.log(
        `Daily Report Generation Complete. Successful tags: ${totalSent}, Failed tags: ${totalFailed}.`
    );

    if (totalFailed > 0) {
        // Non-zero exit so the GitHub Action shows red and we get notified.
        process.exitCode = 1;
    }
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
