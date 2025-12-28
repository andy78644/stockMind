import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CatalystSection } from "./catalyst-section";
import { GenerateReportButton } from "./generate-report-button";
import { ReportList } from "./report-list";
import Link from "next/link";

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

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b pb-2">
                <Link
                    href={`/dashboard/${tagId}`}
                    className="px-4 py-2 text-foreground font-medium border-b-2 border-primary"
                >
                    Daily Reports
                </Link>
                <Link
                    href={`/dashboard/${tagId}/overall`}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    Overall Analysis
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Context/Catalysts */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-2xl font-semibold">Monitoring</h2>
                    <CatalystSection tagId={tag.id} initialCatalysts={tag.catalysts} showHeader={false} />
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

