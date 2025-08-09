// lib/auth.ts (NEXTAUTH v4)
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/",          // usa tu home como pantalla de login
    error: "/auth/error", // página de error amigable (paso 4)
  },
  debug: true,

  callbacks: {
    // ✅ Solo si está en allowlist
    async signIn({ user }) {
      const email = (user.email || "").toLowerCase();
      const allowed = await prisma.allowlist.findUnique({ where: { email } });
      return !!allowed;
    },

    // Mete flags al token para middleware
    async jwt({ token }) {
      if (token.email) {
        const u = await prisma.user.findUnique({ where: { email: token.email } });
        if (u) {
          (token as any).role = u.role;
          (token as any).id = u.id;
          (token as any).isAllowed = u.isAllowed;
        }
      }
      return token;
    },

    // Y a la sesión (lado cliente)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).id = (token as any).id;
        (session.user as any).isAllowed = (token as any).isAllowed;
      }
      return session;
    },
  },

  // 🔁 (Opcional) Re-crear User si está en allowlist
  events: {
    async signIn(message) {
      const email = (message.user.email || "").toLowerCase();
      const allowed = await prisma.allowlist.findUnique({ where: { email } });
      if (!allowed) return;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            email,
            name: message.user.name ?? "",
            image: message.user.image ?? "",
            role: allowed.role,
            isAllowed: true,
          },
        });
      }
    },
  },
};
