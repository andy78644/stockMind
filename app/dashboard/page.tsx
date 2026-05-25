import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTagForm } from "./create-tag-form";
import { NotificationToggle } from "./notification-toggle";
import { WatchlistGrid, type TagWithCount } from "./watchlist-grid";

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) redirect("/auth/signin");


    const [user, tags] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { notificationsEnabled: true },
        }),
        prisma.tag.findMany({
            where: { userId },
            include: {
                _count: { select: { catalysts: true, reports: true } },
                assessments: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        }),
    ]);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
                <div className="flex items-center gap-3">
                    <NotificationToggle enabled={user?.notificationsEnabled ?? true} />
                    <CreateTagForm />
                </div>
            </div>

            <WatchlistGrid tags={tags as unknown as TagWithCount[]} />
        </div>
    );
}
