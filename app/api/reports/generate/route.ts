import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateDailyReport } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { tagId } = body;

        if (!tagId) return new NextResponse("Missing tagId", { status: 400 });

        const tag = await prisma.tag.findUnique({
            where: { id: tagId },
            include: { catalysts: true },
        });

        if (!tag || tag.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const reportContent = await generateDailyReport(
            tag.name,
            tag.catalysts.map((c: { content: string }) => c.content)
        );

        const report = await prisma.dailyReport.create({
            data: {
                content: reportContent,
                tagId: tag.id,
            },
        });

        return NextResponse.json(report);
    } catch (error: any) {
        console.error(error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
