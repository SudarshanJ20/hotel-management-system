// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Allowlists via env
// ADMIN has highest privileges. MANAGER can do CRUD for rooms/guests/bookings but not site settings.
const ADMIN_EMAILS = new Set<string>(
  [process.env.ADMIN_EMAIL].filter((e): e is string => !!e)
);

const MANAGER_EMAILS = new Set<string>(
  (process.env.MANAGER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
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
    // Attach role to JWT (priority: ADMIN > MANAGER > DB role > USER)
    async jwt({ token, user }) {
      let userId = (user as any)?.id ?? token.sub;

      // First-time OAuth: get id by email
      if (!userId && token.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        });
        if (byEmail) userId = String(byEmail.id);
      }

      // Load DB role if id exists
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(userId) },
          select: { id: true, role: true, email: true },
        });

        if (dbUser) {
          (token as any).sub = String(dbUser.id);
          const email = dbUser.email ?? (token.email as string | undefined);

          if (email && ADMIN_EMAILS.has(email)) {
            (token as any).role = "ADMIN";
          } else if (email && MANAGER_EMAILS.has(email)) {
            (token as any).role = "MANAGER";
          } else {
            (token as any).role = dbUser.role ?? (token as any).role;
          }
        }
      }

      // Fresh Google sign-in before DB role update
      if (user && (user as any).email) {
        const email = (user as any).email as string;
        if (ADMIN_EMAILS.has(email)) (token as any).role = "ADMIN";
        else if (MANAGER_EMAILS.has(email)) (token as any).role = "MANAGER";
      }

      if (!(token as any).role) (token as any).role = "USER";
      return token;
    },

    // Mirror role into session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any)?.sub;
        (session.user as any).role = (token as any)?.role ?? "USER";
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
