// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 1) Configure an admin allowlist via env for quick admin access
const ADMIN_EMAILS = new Set<string>(
  [process.env.ADMIN_EMAIL].filter((e): e is string => !!e)
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        // Normalize Google profile into NextAuth User shape
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
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
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
    // 2) jwt: attach role to the token
    async jwt({ token, user }) {
      // Determine user id
      let userId = (user as any)?.id ?? token.sub;

      // If still no id, try email lookup (first-time OAuth)
      if (!userId && token.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        });
        if (byEmail) userId = String(byEmail.id);
      }

      // Read role from DB if we have an id
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(userId) },
          select: { id: true, role: true, email: true },
        });

        if (dbUser) {
          (token as any).sub = String(dbUser.id);

          // If email is in admin allowlist, force ADMIN in token
          const isAllowlisted = dbUser.email && ADMIN_EMAILS.has(dbUser.email);
          (token as any).role = isAllowlisted ? "ADMIN" : dbUser.role ?? (token as any).role;
        }
      }

      // As a fallback, if user just signed in with Google and is allowlisted, set ADMIN
      if (user && (user as any).email && ADMIN_EMAILS.has((user as any).email)) {
        (token as any).role = "ADMIN";
      }

      // Default to USER if still unset
      if (!(token as any).role) (token as any).role = "USER";
      return token;
    },

    // 3) session: mirror role to session.user.role
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any)?.sub;
        (session.user as any).role = (token as any)?.role ?? "USER";
      }
      return session;
    },
  },

  // 4) custom pages
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
