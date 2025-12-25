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

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const catalystId = searchParams.get("id");

        if (!catalystId) return new NextResponse("Missing catalyst id", { status: 400 });

        // Verify ownership through the catalyst's tag
        const catalyst = await prisma.catalyst.findUnique({
            where: { id: catalystId },
            include: { tag: true },
        });

        if (!catalyst || catalyst.tag.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.catalyst.delete({
            where: { id: catalystId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

