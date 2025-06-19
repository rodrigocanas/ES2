"use client";

import { useState, useEffect } from "react";
import type { Post } from "@/lib/types/posts";

type PostFormProps = {
  editingPost?: Post | null;
  onClose: () => void;
  onPostUpdated?: (post: Post) => void;
};

export default function PostForm({ editingPost, onClose, onPostUpdated }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<(string | File)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setPreviews(editingPost.imageUrls || []);
      setImageFiles([]);
      setError("");
    } else {
      setTitle("");
      setContent("");
      setImageFiles([]);
      setPreviews([]);
      setError("");
    }
  }, [editingPost]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const totalImages = previews.length + filesArray.length;

    if (totalImages > 3) {
      setError("Só podes adicionar até 3 imagens no total.");
      return;
    }

    setPreviews(prev => [...prev, ...filesArray]);
    setImageFiles(prev => [...prev, ...filesArray]);
    setError("");
  }

  function removeImage(idx: number) {
    setPreviews(prev => prev.filter((_, i) => i !== idx));

    setImageFiles(prev => {
      // Se o preview removido for um ficheiro, remove-o também do imageFiles
      if (previews[idx] instanceof File) {
        const fileToRemove = previews[idx] as File;
        return prev.filter(file => file !== fileToRemove);
      }
      return prev;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Título e conteúdo são obrigatórios.");
      return;
    }

    if (previews.length > 3) {
      setError("Só podes enviar até 3 imagens no total.");
      return;
    }

    setLoading(true);
    setError("");

    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        alert("Erro ao fazer upload das imagens.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      uploadedUrls.push(data.imageUrl);
    }

    const existingUrls = previews.filter(url => typeof url === "string") as string[];
    const allImageUrls = [...existingUrls, ...uploadedUrls];

    let response;
    if (editingPost) {
      response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrls: allImageUrls }),
      });
    } else {
      response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrls: allImageUrls }),
      });
    }

    if (response.ok) {
      const post: Post = await response.json();
      onPostUpdated?.(post);
      onClose();
    } else {
      alert("Erro ao salvar o post.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 rounded bg-zinc-900 text-white"
        required
      />

      <textarea
        placeholder="Conteúdo"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full p-2 rounded bg-zinc-900 text-white"
        rows={5}
        required
      />

      <div>
        <label className="block mb-1 text-white">Imagens (máx. 3)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFilesChange}
          className="mb-2"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {previews.map((item, idx) => {
            const src = typeof item === "string" ? item : URL.createObjectURL(item);
            return (
              <div
                key={idx}
                className="relative w-24 h-24 rounded overflow-hidden border border-zinc-700"
              >
                <img src={src} alt={`Imagem ${idx + 1}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold"
                  aria-label="Remover imagem"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-900 text-white rounded px-4 py-2 hover:bg-zinc-800 transition flex-1"
        >
          {loading ? (editingPost ? "A editar post..." : "A criar post...") : (editingPost ? "Salvar alterações" : "Criar Post")}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="bg-zinc-700 text-white rounded px-4 py-2 hover:bg-zinc-600 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
