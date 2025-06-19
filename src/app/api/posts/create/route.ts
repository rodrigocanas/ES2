import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const { title, content, imageUrls } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
  }

  // Garantir que imageUrls é um array de strings, mesmo que vazio
  const images = Array.isArray(imageUrls) ? imageUrls : [];

  const post = await prisma.post.create({
    data: {
      title,
      content,
      imageUrls: images,
      authorId: userId,
    },
  });

  return NextResponse.json(post);
}
