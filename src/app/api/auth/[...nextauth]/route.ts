// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    async jwt({ token, user }) {
      // Try id from user, else token.sub, else fetch by email for first-time OAuth
      let userId = (user as any)?.id ?? token.sub;

      if (!userId && token.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        });
        if (byEmail) userId = String(byEmail.id);
      }

      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(userId) },
          select: { id: true, role: true },
        });
        if (dbUser) {
          (token as any).sub = String(dbUser.id);
          (token as any).role = dbUser.role;
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
