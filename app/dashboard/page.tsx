import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTagForm } from "./create-tag-form";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    const tags = await prisma.tag.findMany({
        where: { userId: session.user?.id },
        include: { _count: { select: { catalysts: true, reports: true } } },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
                <CreateTagForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={`/dashboard/${tag.id}`}
                        className="group block p-6 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{tag.name}</h2>
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{tag.type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• {tag._count.catalysts} Catalysts watching</p>
                            <p>• {tag._count.reports} Reports generated</p>
                        </div>
                    </Link>
                ))}

                {tags.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No tags yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
