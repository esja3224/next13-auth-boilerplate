import { TOKEN_TYPES } from "./constants";
import { cacheToken, getTokenFromCache } from "./tokenCache";

const refreshAccessToken = async (id: string) => {

    const tokenEndpoint = process.env.KEYCLOAK_TOKEN_ENDPOINT
    const clientID = process.env.KEYCLOAK_ID
    const clientSecret = process.env.KEYCLOAK_SECRET
    if (!tokenEndpoint || !clientID || !clientSecret) throw new Error("Environment variables not set.")

    const tokenURL = new URL(tokenEndpoint)

    const refreshToken = await getTokenFromCache(id, TOKEN_TYPES.REFRESH_TOKEN)
    if (!refreshToken) throw new Error("Refresh token error.")

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }),
    };
    const response = await (await fetch(tokenURL, options)).json()
    const accessToken: JWTWithExpiry = {
        token: response.access_token,
        expires_in: response.expires_in,
        type: TOKEN_TYPES.ACCESS_TOKEN
    }
    await cacheToken(accessToken, id)
}

export default refreshAccessToken;