// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // IMPORTANT: switch to JWT so middleware can read token.role
  session: { strategy: "jwt" }, // CHANGED
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        const partial = user as unknown as {
          id: string | number;
          email?: string | null;
          name?: string | null;
          image?: string | null;
          role?: string | null;
        };

        return {
          id: String(partial.id),
          email: partial.email ?? undefined,
          name: partial.name ?? undefined,
          image: partial.image ?? undefined,
          // role will be added in jwt callback from DB user on first sign-in
        } as unknown as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, copy role from DB user into the JWT
      if (user) {
        // Fetch latest role for OAuth sign-ins as well
        // (token.sub = user id after first sign-in)
        const dbUserId = (user as any).id ?? token.sub;
        if (dbUserId) {
          const dbUser = await prisma.user.findUnique({ where: { id: String(dbUserId) }, select: { role: true, id: true } });
          (token as any).role = dbUser?.role ?? (token as any).role;
          (token as any).sub = String(dbUserId);
        } else {
          (token as any).role = (user as any).role ?? (token as any).role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any)?.sub;
        (session.user as any).role = (token as any)?.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
