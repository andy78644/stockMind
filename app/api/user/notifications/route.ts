import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
        return new NextResponse("Missing or invalid 'enabled' field", { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { notificationsEnabled: enabled },
        select: { notificationsEnabled: true },
    });

    return NextResponse.json(user);
}
