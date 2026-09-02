import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "./prisma";
import { isStaffRole, SUBSCRIBER_SESSION_MAX_AGE } from "./roles";

async function syncNewsletterSubscription(email: string) {
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isConfirmed: true },
    create: { email, isConfirmed: true },
  });
}

function buildProviders() {
  const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // Les comptes de la rédaction et les abonnés qui ont créé un mot de
        // passe utilisent tous deux ce provider. Les abonnés par lien magique
        // n'ont pas de mot de passe et ne peuvent donc pas s'y connecter.
        if (!user || !user.isActive || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Google fournit une adresse e-mail vérifiée. Cela permet à un lecteur
        // ayant d'abord créé son compte avec e-mail/mot de passe de retrouver
        // le même compte avec Google, sans créer de doublon.
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    providers.push(
      EmailProvider({
        server: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
        from: process.env.SMTP_FROM || "noreply@lushipost.com",
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SUBSCRIBER_SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/connexion",
    error: "/connexion",
    verifyRequest: "/connexion/verify",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        return !!dbUser && dbUser.isActive && !!dbUser.passwordHash;
      }

      if (account?.provider === "google" || account?.provider === "email") {
        const dbUser = await prisma.user.findUnique({ where: { email } });

        if (dbUser && isStaffRole(dbUser.role)) {
          return "/connexion?error=staff-use-password&mode=staff";
        }

        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        let role = (user as { role?: string }).role;
        if (!role && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase().trim() },
            select: { role: true, id: true },
          });
          role = dbUser?.role;
          if (dbUser?.id) token.id = dbUser.id;
        }
        token.role = role;
        token.id = (user.id as string | undefined) ?? token.id;
        token.sub = token.id ?? token.sub;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
      }

      // Le JWT peut durer longtemps, mais ses droits doivent toujours refléter
      // le compte courant : un compte désactivé ou rétrogradé est effectif dès
      // la prochaine requête, sans attendre son expiration.
      if (token.sub || token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: token.sub ? { id: String(token.sub) } : { email: String(token.email).toLowerCase().trim() },
            select: { role: true, id: true, email: true, name: true, isActive: true },
          });
          if (dbUser?.isActive) {
            token.role = dbUser.role;
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name ?? token.name;
          } else if (dbUser) {
            token.id = undefined;
            token.sub = undefined;
            token.role = undefined;
            token.email = undefined;
            token.name = undefined;
          }
        } catch {
          // Ne pas faire échouer la session si le repli base de données échoue.
        }
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.email = session.user.email ?? token.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role =
          token.role as string;
        (session.user as { id?: string }).id = token.id as string;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        const dest = new URL(url);
        if (dest.origin === new URL(baseUrl).origin) return url;
      } catch {
        // URL invalide : retomber sur l'accueil plutôt que de faire échouer la connexion.
      }
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.ABONNE },
      });
      if (user.email) {
        await syncNewsletterSubscription(user.email.toLowerCase().trim());
      }
    },
    async signIn({ user, account }) {
      if (
        (account?.provider === "google" || account?.provider === "email") &&
        user.email
      ) {
        await syncNewsletterSubscription(user.email.toLowerCase().trim());
      }
    },
  },
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};
