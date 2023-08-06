import { cache, getExpiryFromCache, getFromCache } from "./redisClient"

export const cacheToken = async (token: JWTWithExpiry, sessionId: string) => {
    await cache(tokenKey(sessionId, token.type), token.token, token.expires_in)
}

export const getTokenExpiryFromCache = async(sessionId: string, type: string) => {
    return await getExpiryFromCache(tokenKey(sessionId, type))
}

export const getTokenFromCache = async(sessionId: string, type: string) => {
    return await getFromCache(tokenKey(sessionId, type))
}

const tokenKey = (sessionId: string, type: string) => `${sessionId}-${type}`
