// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      bio?: string | null;
      location?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    location?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    location?: string | null;
  }
}
