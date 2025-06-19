import { prisma } from "@/lib/prisma";
import ClientPostSection from "@/components/ClientPostSection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const session = await getServerSession(authOptions);
  const userId = session ? Number(session.user.id) : null;

  const postsRaw = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      likes: true,
      favorites: true,
      comments: {
        include: { author: true },
      },
    },
  });

  const posts = postsRaw.map(post => {
    const likedByMe = userId ? post.likes.some(like => like.userId === userId) : false;
    const favoritedByMe = userId ? post.favorites.some(fav => fav.userId === userId) : false;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt.toISOString(),
      likedByMe,
      favoritedByMe,
      likesCount: post.likes.length,
      favoritesCount: post.favorites.length,
      comments: post.comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.author,
        createdAt: c.createdAt.toISOString(),
      })),
      imageUrls: post.imageUrls ?? [],
    };
  });

  return (
    <main className="container max-w-4xl mx-auto py-10 px-6">
      <ClientPostSection posts={posts} currentUserId={userId} />
    </main>
  );
}
