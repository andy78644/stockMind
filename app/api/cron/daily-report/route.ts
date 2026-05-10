import { prisma } from "@/lib/db";
import { sendDailyReportEmail } from "@/lib/email";
import { generateEmailHtml, processUserAssessments } from "@/lib/dailyReport";
import { NextResponse } from "next/server";

// Force dynamic to ensure it runs every time called
export const dynamic = "force-dynamic";
// Set max duration to 5 minutes (300 seconds) for Vercel Pro, or max allowed for Hobby (usually 10s or 60s)
export const maxDuration = 300;

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            include: {
                tags: {
                    include: { catalysts: true },
                },
            },
        });

        console.log(`Starting daily report for ${users.length} users...`);

        const summary: Array<{ email: string; sent: number; failed: number }> = [];

        for (const user of users) {
            if (!user.email || user.tags.length === 0) continue;

            const { assessments, failures } = await processUserAssessments(user);

            if (assessments.length === 0 && failures.length === 0) continue;

            const dateStr = new Date().toISOString().split("T")[0];
            const subject = failures.length
                ? `每日投資速報 (部分失敗 ${failures.length}) - ${dateStr}`
                : `每日投資速報 - ${dateStr}`;

            await sendDailyReportEmail(
                user.email,
                generateEmailHtml(assessments, failures),
                subject
            );
            console.log(
                `Email sent to ${user.email} — success: ${assessments.length}, failed: ${failures.length}`
            );
            summary.push({ email: user.email, sent: assessments.length, failed: failures.length });
        }

        return NextResponse.json({ success: true, summary });
    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
