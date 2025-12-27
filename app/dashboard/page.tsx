import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTagForm } from "./create-tag-form";

interface TagWithCount {
    id: string;
    name: string;
    type: string;
    _count: {
        catalysts: number;
        reports: number;
    };
    assessments: {
        id: string;
        date: Date;
        points: string[];
        sentiment: string;
        summary: string | null;
    }[];
}

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) redirect("/auth/signin");


    const tags = await prisma.tag.findMany({
        where: { userId },
        include: {
            _count: { select: { catalysts: true, reports: true } },
            assessments: {
                orderBy: { date: 'desc' },
                take: 1
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
                <CreateTagForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.map((tag) => {
                    const latestAssessment = tag.assessments[0];
                    const sentimentColor = latestAssessment?.sentiment === 'POSITIVE' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' :
                        latestAssessment?.sentiment === 'NEGATIVE' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' :
                            latestAssessment?.sentiment === 'NEUTRAL' ? 'border-gray-400 bg-gray-50/50 dark:bg-gray-800/10' :
                                'border-transparent';

                    return (
                        <Link
                            key={tag.id}
                            href={`/dashboard/${tag.id}`}
                            className={`group block p-6 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg relative overflow-hidden ${latestAssessment ? 'border-l-4 ' + sentimentColor : ''}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{tag.name}</h2>
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{tag.type}</span>
                            </div>

                            {latestAssessment && (
                                <div className="mb-4 p-3 bg-secondary/30 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${latestAssessment.sentiment === 'POSITIVE' ? 'bg-green-200 text-green-800' :
                                            latestAssessment.sentiment === 'NEGATIVE' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                            {latestAssessment.sentiment}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(latestAssessment.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-medium mb-1 line-clamp-2">{latestAssessment.summary}</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                        {latestAssessment.points.slice(0, 2).map((point: string, i: number) => (
                                            <li key={i} className="line-clamp-1">{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>• {tag._count.catalysts} Catalysts watching</p>
                                <p>• {tag._count.reports} Reports generated</p>
                            </div>
                        </Link>
                    );
                })}

                {tags.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No tags yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
