import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    token: JWT 
  }
  interface Account {
    refresh_expires_in: number
  }
}