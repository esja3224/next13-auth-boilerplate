import { Redis } from "ioredis";

const redis = new Redis(6379, 'localhost');

export const getFromCache = async (key: string) => {
    return await redis.get(key)
}

export const getExpiryFromCache = async (key: string) => {
    return await redis.ttl(key)
}

export const cache = async (key: string, value: string, expiry?: number) => {
    return expiry ? await cacheWithExpiry(key, value, expiry) : cacheWithoutExpiry(key, value) 
}

export const deleteFromCache = async(key: string) => {
    return await redis.del(key)
}

const cacheWithoutExpiry = async (key: string, value: string) => {
    return await redis.set(key, value)
}

const cacheWithExpiry = async(key: string, value: string, expiry: number) => {
    return await redis.set(key, value, "EX", expiry)
}