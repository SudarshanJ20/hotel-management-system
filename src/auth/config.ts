// src/auth/config.ts
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = new Set<string>(
  [process.env.ADMIN_EMAIL].filter((email): email is string => Boolean(email))
);

const MANAGER_EMAILS = new Set<string>(
  (process.env.MANAGER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        } as unknown as NextAuthUser;
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) {
          throw new Error("Invalid credentials");
        }

        return {
          id: String(user.id),
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        } as unknown as NextAuthUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // When user logs in (Google or credentials), copy basic fields into token
      if (user) {
        const anyUser = user as any;
        token.sub = anyUser.id ?? token.sub;
        token.email = anyUser.email ?? token.email;
        token.name = anyUser.name ?? token.name;
        token.picture = anyUser.image ?? (token as any).picture;
      }

      // Role from email + env sets (no Prisma here)
      const email = (token.email ?? (token as any).email) as string | undefined;
      if (email && ADMIN_EMAILS.has(email)) {
        (token as any).role = "ADMIN";
      } else if (email && MANAGER_EMAILS.has(email)) {
        (token as any).role = "MANAGER";
      } else if (!(token as any).role) {
        (token as any).role = "USER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any)?.sub;
        (session.user as any).role = (token as any)?.role ?? "USER";
        session.user.name = token.name as string | undefined;
        session.user.image = (token as any).picture as string | undefined;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};
