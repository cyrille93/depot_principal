import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { identifiant: {}, password: {} },
      authorize: async (creds) => {
        const parsed = loginSchema.safeParse(creds);
        if (!parsed.success) return null;

        const { identifiant, password } = parsed.data;
        const estEmail = identifiant.includes("@");
        const user = estEmail
          ? await db.user.findUnique({ where: { email: identifiant.trim().toLowerCase() } })
          : await db.user.findUnique({ where: { telephone: identifiant.replace(/\s+/g, "") } });
        if (!user || !user.motDePasseHash) return null;
        if (user.statut !== "ACTIF") return null;

        const ok = await verifyPassword(password, user.motDePasseHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          locale: user.locale,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string;
        token.role = (user as { role?: "CLIENT" | "PRO" | "ADMIN" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as "CLIENT" | "PRO" | "ADMIN";
      }
      return session;
    },
  },
});
