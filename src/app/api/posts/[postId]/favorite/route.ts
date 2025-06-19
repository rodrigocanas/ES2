import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const postId = Number(params.postId);

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existingFavorite) {
    // Remove favorito
    await prisma.favorite.delete({ where: { id: existingFavorite.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Adiciona favorito
    await prisma.favorite.create({
      data: { userId, postId },
    });
    return NextResponse.json({ favorited: true });
  }
}
