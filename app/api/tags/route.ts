import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const tags = await prisma.tag.findMany({
        where: { userId: session.user.id },
        include: { catalysts: true }, // Include stats?
    });

    return NextResponse.json(tags);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { name, type } = body;

        if (!name || !type) return new NextResponse("Missing fields", { status: 400 });

        const tag = await prisma.tag.create({
            data: {
                name,
                type,
                userId: session.user.id,
            },
        });

        return NextResponse.json(tag);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
