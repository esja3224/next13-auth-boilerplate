import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from 'next/server'
 
export async function GET(request: NextRequest) {
    console.log("stop logging");
    console.log(await getToken({req: request}))

//   const res = await fetch('https://data.mongodb-api.com/...', {
//     headers: {
//       'Content-Type': 'application/json',
//       'API-Key': process.env.DATA_API_KEY,
//     },
//   })
//   const data = await res.json()
 
  return NextResponse.json({ hello: "world" })
}