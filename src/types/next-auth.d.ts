import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    refresh_token_state: string,
    refresh_token_expiry: number
  }
  interface Account {
    refresh_expires_in: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string,
    refresh_token_state: string,
    refresh_token_expiry: number
  }
}