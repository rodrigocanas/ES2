// app/api/update/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { name, bio, location } = await req.json();

  try {
    const user = await prisma.user.update({
  where: { email: session.user.email },
  data: {
    name,
    bio,
    location,
  },
});


    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar o perfil" }, { status: 500 });
  }
}
