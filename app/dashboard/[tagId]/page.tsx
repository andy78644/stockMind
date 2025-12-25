import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CatalystSection } from "./catalyst-section";
import { GenerateReportButton } from "./generate-report-button";
import { ReportList } from "./report-list";

export default async function TagPage({ params }: { params: Promise<{ tagId: string }> }) {
    const { tagId } = await params;
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    const tag = await prisma.tag.findUnique({
        where: { id: tagId },
        include: {
            catalysts: true,
            reports: { orderBy: { date: 'desc' } }
        },
    });

    if (!tag || tag.userId !== session.user?.id) {
        return <div>Tag not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{tag.name}</h1>
                    <span className="text-muted-foreground">{tag.type} Watchlist</span>
                </div>
                <GenerateReportButton tagId={tag.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Context/Catalysts */}
                <div className="lg:col-span-1 space-y-6">
                    <CatalystSection tagId={tag.id} initialCatalysts={tag.catalysts} />
                </div>

                {/* Right Column: Intelligence/Reports */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold">Intelligence Feed</h2>
                    <ReportList reports={tag.reports} />
                </div>
            </div>
        </div>
    );
}
