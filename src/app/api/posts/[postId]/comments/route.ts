import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = Number(params.postId);

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const postId = Number(params.postId);

  const { content } = await request.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      postId,
    },
    include: {
      author: true,
    },
  });

  return NextResponse.json(comment);
}
