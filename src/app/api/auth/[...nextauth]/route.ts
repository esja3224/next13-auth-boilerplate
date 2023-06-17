import NextAuth, { NextAuthOptions } from 'next-auth';
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
        clientId: process.env.KEYCLOAK_ID || "",
        clientSecret: process.env.KEYCLOAK_SECRET || "",
        issuer: process.env.KEYCLOAK_ISSUER,
      })
  ],
  callbacks: {
    async jwt({ token }) {
      console.log(token)
      return token
    },
  },
  events: {
    async signIn({ user }) {
        console.log(`${user.name} signed in.`)
    },
    async signOut({ token }) {
        console.log(`${token.name} signed out.`)
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };