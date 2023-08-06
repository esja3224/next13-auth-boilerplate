import { randomUUID } from 'crypto';
import NextAuth, { NextAuthOptions } from 'next-auth';
import KeycloakProvider from "next-auth/providers/keycloak";
import { TOKEN_STATE, TOKEN_TYPES } from '@/src/lib/constants';
import { cacheToken } from '@/src/lib/tokenCache';
import refreshAccessToken from '@/src/lib/refreshAccessToken';
import { getTokenExpiryFromCache } from '../../../../lib/tokenCache';

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
        clientId: process.env.KEYCLOAK_ID || "",
        clientSecret: process.env.KEYCLOAK_SECRET || "",
        issuer: process.env.KEYCLOAK_ISSUER,
      })
  ],
  callbacks: {
    async jwt({ token, trigger, account }) {
      if (trigger === "signIn") {
        // assign ID to identify session
        const sessionId = randomUUID()
        token.id = sessionId
        token.refreshTokenExpiry = account?.refresh_expires_in ?? 0
        // extract tokens
        const access_token: JWTWithExpiry = {
          token: account?.access_token ?? "",
          expires_in: (account?.expires_at ?? Date.now()) - Math.floor(Date.now() / 1000),
          type: TOKEN_TYPES.ACCESS_TOKEN
        }

        const refresh_token: JWTWithExpiry = {
          token: account?.refresh_token ?? "",
          expires_in: account?.refresh_expires_in ?? 0,
          type: TOKEN_TYPES.REFRESH_TOKEN
        }

        // cache these into redis
        await cacheToken(access_token, sessionId)
        await cacheToken(refresh_token, sessionId)
        return token
      }
      
      // go to redis to get both refresh & access token
      const accessTokenExpiry = await getTokenExpiryFromCache(token.id as string, TOKEN_TYPES.ACCESS_TOKEN)
      const refreshTokenExpiry = await getTokenExpiryFromCache(token.id as string, TOKEN_TYPES.REFRESH_TOKEN)

      token.refreshTokenExpiry = refreshTokenExpiry
      // METHOD TO SET STATE AND REFRESH EXPIRY TIME ON TOKEN

      const ONE_MINUTE = 60 * 1000
      const ZERO_MINUTES = 0 * ONE_MINUTE;
      const TEN_MINUTES = 10 * ONE_MINUTE;

      if (refreshTokenExpiry <= ZERO_MINUTES)
        token.refreshTokenState = TOKEN_STATE.EXPIRED
      else if (refreshTokenExpiry < TEN_MINUTES)
        token.refreshTokenState = TOKEN_STATE.LESS_THAN_TEN_MINUTES
      else 
        token.refreshTokenState = TOKEN_STATE.MORE_THAN_TEN_MINUTES

      // refresh access token if NECESSARY?
      // if access token not expiring in a minute, do nothing
      if (accessTokenExpiry > ONE_MINUTE)
         return token;

      if (refreshTokenExpiry > ZERO_MINUTES)
        try {
          refreshAccessToken(token.id as string)
        } catch (e) {
          // Assume any error means token is expired, re-trigger sign in?
          token.refreshTokenState = TOKEN_STATE.EXPIRED
          token.refreshTokenExpiry = ZERO_MINUTES
        }
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