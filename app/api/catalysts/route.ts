import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { content, tagId } = body;

        if (!content || !tagId) return new NextResponse("Missing fields", { status: 400 });

        // Verify ownership
        const tag = await prisma.tag.findUnique({
            where: { id: tagId },
        });

        if (!tag || tag.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const catalyst = await prisma.catalyst.create({
            data: {
                content,
                tagId,
            },
        });

        return NextResponse.json(catalyst);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
