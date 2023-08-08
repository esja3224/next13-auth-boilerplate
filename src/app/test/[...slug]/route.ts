import { NextRequest, NextResponse } from 'next/server'


// Test route to mock the backend API - can delete
async function handler(request: NextRequest) {
    console.log(request.headers)
    return NextResponse.json({ hello: "world" })
}

export {handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as HEAD, handler as OPTIONS};