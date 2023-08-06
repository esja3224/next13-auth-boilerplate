import { NextRequest, NextResponse } from 'next/server'
import { getTokenExpiryFromCache, getTokenFromCache } from '../../../lib/tokenCache';
import { getToken } from 'next-auth/jwt';
import { TOKEN_TYPES } from '../../../lib/constants';
 
async function handler(request: NextRequest, context: {params: {slug: string}}) {
  const BACKEND_BASE_URL = "http://localhost:3000/test/"
  const rewriteURL = new URL(context.params.slug, BACKEND_BASE_URL)

  const token = await getToken({req: request})
  if (!token?.id) {
    console.log("ERROR: Attempt to call API with invalid session. Try signing in again.")
    return NextResponse.error()
  }

  if (await getTokenExpiryFromCache(token.id, TOKEN_TYPES.ACCESS_TOKEN) <= 0) {
    console.log("ERROR: Attempt to call API with expired access token.")
    return NextResponse.error()
  }

  const accessToken = await getTokenFromCache(token.id, TOKEN_TYPES.ACCESS_TOKEN)
  
  const headers = new Headers(request.headers)
  headers.append("Authorization", `Bearer ${accessToken}`)

  const fetchOptions = {
    headers: headers,
    method: request.method,
    body: request.body
  }

  return await fetch(rewriteURL, fetchOptions)
}

export {handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as HEAD, handler as OPTIONS};