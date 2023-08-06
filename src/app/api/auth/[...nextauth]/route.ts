import { randomUUID } from 'crypto';
import NextAuth, { Account, NextAuthOptions } from 'next-auth';
import KeycloakProvider from "next-auth/providers/keycloak";
import { TOKEN_STATE, TOKEN_TYPES } from '@/src/lib/constants';
import { cacheToken, deleteTokenFromCache } from '@/src/lib/tokenCache';
import refreshAccessToken from '@/src/lib/refreshAccessToken';
import { getTokenExpiryFromCache } from '../../../../lib/tokenCache';
import { JWT } from 'next-auth/jwt';

const ONE_MINUTE = 60 * 1000
const ZERO_MINUTES = 0 * ONE_MINUTE;
const TEN_MINUTES = 10 * ONE_MINUTE;

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
        clientId: process.env.KEYCLOAK_ID || "",
        clientSecret: process.env.KEYCLOAK_SECRET || "",
        issuer: process.env.KEYCLOAK_ISSUER,
      })
  ],
  callbacks: {
    async session({session, token}) {
      // Augment session with refresh token details so client can handle expiry
      session.refresh_token_expiry = token.refresh_token_expiry,
      session.refresh_token_state = token.refresh_token_state
      return session
    },
    async jwt({ token, trigger, account }) {
      if (trigger === "signIn") {
        handleTokensOnSignIn(token, account)
        return token
      }
      
      // Get token expiries from cache
      const accessTokenExpiry = await getTokenExpiryFromCache(token.id as string, TOKEN_TYPES.ACCESS_TOKEN)
      const refreshTokenExpiry = await getTokenExpiryFromCache(token.id as string, TOKEN_TYPES.REFRESH_TOKEN)

      // Update refresh token expiry
      updateTokenWithRefreshTokenExpiry(token, refreshTokenExpiry)

      // Refresh access token if necessary
      if (accessTokenExpiry > ONE_MINUTE)
         return token;

      if (refreshTokenExpiry > ZERO_MINUTES)
        try {
          refreshAccessToken(token.id)
        } catch (e) {
          // Assume any refreshing error means refresh token is expired
          updateTokenWithRefreshTokenExpiry(token, ZERO_MINUTES)
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

        // Session has been deleted, clean up cached tokens
        deleteTokenFromCache(token.id, TOKEN_TYPES.ACCESS_TOKEN)
        deleteTokenFromCache(token.id, TOKEN_TYPES.REFRESH_TOKEN)
    }
  }
};

const updateTokenWithRefreshTokenExpiry = (token: JWT, refreshTokenExpiry: number) => {
  token.refresh_token_expiry = refreshTokenExpiry
  token.refresh_token_state = toTokenState(refreshTokenExpiry)
}

const handleTokensOnSignIn = async (token: JWT, account: Account | null) => {
    // Assign ID to identify session
    const sessionId = randomUUID()
    token.id = sessionId

    // Update refresh token expiry
    const refreshTokenExpiry = account?.refresh_expires_in ?? 0
    updateTokenWithRefreshTokenExpiry(token, refreshTokenExpiry)

    // Cache tokens
    cacheTokens(account, sessionId)
}

const toTokenState = (tokenExpiry: number) => {
  if (tokenExpiry <= ZERO_MINUTES)
    return TOKEN_STATE.EXPIRED
  else if (tokenExpiry < TEN_MINUTES)
    return TOKEN_STATE.LESS_THAN_TEN_MINUTES
  else 
    return TOKEN_STATE.MORE_THAN_TEN_MINUTES
}

const cacheTokens = async (account: Account | null, sessionId: string) => {
  // Extract tokens
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

  // Cache tokens
  await cacheToken(access_token, sessionId)
  await cacheToken(refresh_token, sessionId)
} 

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };