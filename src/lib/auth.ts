import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "../lib/db"
import { z } from "zod";
import { is } from "zod/v4/locales";

const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
   adapter: PrismaAdapter(db),
   session: { strategy: "jwt" },
   pages: {
    signIn: "/login",
    error: "/login",
   }, 
   providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
        async authorize(credentials) {
            const parsed = loginSchema.safeParse(credentials);
            if (!parsed.success) return null;
            
            const { email, password } = parsed.data;

            const user = await db.user.findUnique({ where: { email } });
            if (!user || !user.password) return null;

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;

            return user;
        }
    })
   ],

   callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.role = (user as any).role;
        }
        return token;
    },
    async session({ session, token }) {
        if (token) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
        }
        return session;
    },
   },
});