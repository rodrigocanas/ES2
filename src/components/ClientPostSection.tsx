"use client";

import { useState, Suspense } from "react";
import type { Post } from "@/lib/types/posts";
import dynamic from "next/dynamic";

const PostForm = dynamic(() => import("@/app/(auth)/posts/components/PostForm"), { ssr: false });

type User = {
  id: number;
  name?: string | null;
  email: string;
};

type Comment = {
  id: number;
  content: string;
  author: User;
  createdAt: string;
};



export default function ClientPostSection({
  posts: initialPosts,
  currentUserId,
}: {
  posts: Post[];
  currentUserId: number | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loadingLikeIds, setLoadingLikeIds] = useState<number[]>([]);
  const [loadingFavoriteIds, setLoadingFavoriteIds] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [loadingCommentIds, setLoadingCommentIds] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  async function toggleLike(postId: number) {
    setLoadingLikeIds(ids => [...ids, postId]);
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts =>
        posts.map(post => {
          if (post.id === postId) {
            const liked = data.liked;
            const likesCount = liked ? post.likesCount + 1 : post.likesCount - 1;
            return { ...post, likedByMe: liked, likesCount };
          }
          return post;
        })
      );
    }
    setLoadingLikeIds(ids => ids.filter(id => id !== postId));
  }

  async function toggleFavorite(postId: number) {
    setLoadingFavoriteIds(ids => [...ids, postId]);
    const res = await fetch(`/api/posts/${postId}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts =>
        posts.map(post => {
          if (post.id === postId) {
            const favorited = data.favorited;
            const favoritesCount = favorited ? post.favoritesCount + 1 : post.favoritesCount - 1;
            return { ...post, favoritedByMe: favorited, favoritesCount };
          }
          return post;
        })
      );
    }
    setLoadingFavoriteIds(ids => ids.filter(id => id !== postId));
  }

  async function submitComment(postId: number) {
    const content = commentInputs[postId]?.trim();
    if (!content) return alert("O comentário não pode estar vazio.");

    setLoadingCommentIds(ids => [...ids, postId]);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setPosts(posts =>
        posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
        })
      );
      setCommentInputs(inputs => ({ ...inputs, [postId]: "" }));
    } else {
      alert("Erro ao enviar comentário.");
    }
    setLoadingCommentIds(ids => ids.filter(id => id !== postId));
  }

  async function deletePost(postId: number) {
    if (!confirm("Tens a certeza que queres apagar este post?")) return;

    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts => posts.filter(post => post.id !== postId));
      alert("Post apagado com sucesso.");
    } else {
      alert("Erro ao apagar post.");
    }
    setOpenMenuId(null);
  }

  function startEditPost(post: Post) {
    setEditingPost(post);
    setShowForm(true);
    setOpenMenuId(null);
  }

  function closeEdit() {
    setEditingPost(null);
    setShowForm(false);
  }

  // Depois de um post editado, atualiza lista (podes passar esta função para o PostForm)
  function updatePost(updatedPost: Post) {
    setPosts(posts => posts.map(p => (p.id === updatedPost.id ? updatedPost : p)));
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white">Todos os Posts</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingPost(null);
          }}
          className="bg-zinc-900 text-white rounded-lg shadow-sm p-6 hover:shadow-md transition mt-2"
        >
          {showForm ? "Fechar" : "+ Criar Post"}
        </button>
      </header>

      {showForm && (
        <div className="mb-10">
          <Suspense fallback={<p className="text-white">A carregar formulário...</p>}>
            <PostForm
              onClose={closeEdit}
              editingPost={editingPost}
              onPostUpdated={updatePost}
            />
          </Suspense>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground italic text-white">Ainda não há posts.</p>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article
              key={post.id}
              className="bg-zinc-900 text-white rounded-lg shadow-sm p-6 hover:shadow-md transition flex"
            >
              <div className="flex-1 pr-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-semibold">{post.title}</h2>

                  {/* Menu de 3 pontos */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-2 rounded hover:bg-zinc-800"
                      aria-label="Abrir menu opções"
                      title="Opções"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                      >
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>

                    {openMenuId === post.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-zinc-900 rounded shadow-lg z-10 text-white">  
                        <button
                          onClick={() => {
                            alert("Post denunciado.");
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-zinc-700"
                        >
                          Denunciar
                        </button>

                        {post.author.id === currentUserId && (
                          <>
                            <button
                              onClick={() => startEditPost(post)}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deletePost(post.id)}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-700 text-red-500"
                            >
                              Apagar
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Por <span className="font-medium">{post.author.name ?? post.author.email}</span> em{" "}
                  {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                </p>

                <p className="text-base leading-relaxed text-white/90 mb-4">{post.content}</p>

                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="flex gap-4 my-4 flex-wrap">
                    {post.imageUrls.map((url, idx) => {
                      console.log("Imagem URL:", url);
                      return (
                        <img
                          key={idx}
                          src={url}
                          alt={`Imagem do post ${idx + 1}`}
                          className="w-32 h-32 object-cover rounded"
                        />
                      );
                    })}
                  </div>
                )}



                <div>
                  <h3 className="font-semibold mb-2">Comentários</h3>
                  {post.comments.length === 0 ? (
                    <p className="italic text-sm text-muted-foreground text-white">Sem comentários.</p>
                  ) : (
                    <ul className="mb-4 max-h-48 overflow-y-auto space-y-2">
                      {post.comments.map(c => (
                        <li key={c.id} className="border-b border-zinc-700 pb-1">
                          <p className="text-sm">{c.content}</p>
                          <p className="text-xs text-muted-foreground">
                            — {c.author.name ?? c.author.email},{" "}
                            {new Date(c.createdAt).toLocaleDateString("pt-PT")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Comentário inline com botão enviar */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id={`comment-textarea-${post.id}`}
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={e =>
                        setCommentInputs(inputs => ({ ...inputs, [post.id]: e.target.value }))
                      }
                      placeholder="Escreve um comentário..."
                      className="flex-grow p-2 rounded bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitComment(post.id);
                        }
                      }}
                      aria-label="Escreve um comentário"
                    />
                    <button
                      disabled={loadingCommentIds.includes(post.id)}
                      onClick={() => submitComment(post.id)}
                      aria-label="Enviar comentário"
                      title="Enviar comentário"
                      className="bg-white p-2 rounded hover:bg-gray-200 transition flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="black"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22 11 13 2 9l20-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Coluna direita com ícones e contagem */}
              <div className="flex flex-col items-center justify-start gap-6 min-w-[60px]">
                {/* Like */}
                <div className="flex flex-col items-center">
                  <button
                    disabled={loadingLikeIds.includes(post.id)}
                    onClick={() => toggleLike(post.id)}
                    aria-label="Gostar"
                    title="Gostar"
                    className="w-10 h-10 flex items-center justify-center transition rounded-md hover:bg-white hover:text-black"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={post.likedByMe ? "white" : "none"}
                      stroke="white"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>

                  <span className="text-white text-xs mt-1">{post.likesCount ?? 0}</span>
                </div>

                {/* Favorite */}
                <div className="flex flex-col items-center">
                  <button
                    disabled={loadingFavoriteIds.includes(post.id)}
                    onClick={() => toggleFavorite(post.id)}
                    aria-label="Favoritar"
                    title="Favoritar"
                    className="w-10 h-10 flex items-center justify-center transition rounded-md hover:bg-white hover:text-black"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={post.favoritedByMe ? "white" : "none"}
                      stroke="white"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  </button>
                  <span className="text-white text-xs mt-1">{post.favoritesCount ?? 0}</span>

                </div>

                {/* Comentário */}
                <div className="flex flex-col items-center">
                  <button
                    aria-label="Comentar"
                    title="Comentar"
                    onClick={() => {
                      const textarea = document.getElementById(`comment-textarea-${post.id}`);
                      textarea?.focus();
                    }}
                    className="w-10 h-10 flex items-center justify-center transition rounded-md hover:bg-white hover:text-black"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="white"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-3.582 7-8 7a8.96 8.96 0 01-4-.95L3 19l1.95-5.05A6.973 6.973 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                      />
                    </svg>
                  </button>
                  <span className="text-white text-xs mt-1">{post.comments.length}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
