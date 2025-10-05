import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, email }) {
      if (email?.verificationRequest) {
        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Create user if they don't exist
          await prisma.user.create({
            data: {
              email: user.email!,
              role: "user", // Default role
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Get user role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true }
        });
        token.role = dbUser?.role || "user";
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
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
};
