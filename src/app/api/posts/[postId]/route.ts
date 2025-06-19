import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const postId = Number(params.postId);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  if (post.authorId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ message: "Post apagado com sucesso" });
}

export async function PATCH(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const postId = Number(params.postId);
  const { title, content, imageUrls } = await request.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Título e conteúdo são obrigatórios" },
      { status: 400 }
    );
  }

  if (!Array.isArray(imageUrls)) {
    return NextResponse.json(
      { error: "imageUrls tem de ser um array" },
      { status: 400 }
    );
  }

  if (imageUrls.length > 3) {
    return NextResponse.json(
      { error: "Só podes enviar até 3 imagens" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post)
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

  if (post.authorId !== userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      imageUrls,
    },
    include: {
      author: true,
      comments: true, // se quiseres incluir comentários atualizados também
    },
  });

  return NextResponse.json(updatedPost);
}