// src/types.ts

export type User = {
  id: number;
  name?: string | null;
  email: string;
};

export type Comment = {
  id: number;
  content: string;
  author: User;
  createdAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  likedByMe: boolean;
  favoritedByMe: boolean;
  likesCount: number;
  favoritesCount: number;
  comments: Comment[];
  imageUrls: string[];
};
