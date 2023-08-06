'use client';

import { signOut, useSession } from "next-auth/react"

const SignOut = () => {
    return <button onClick={() => signOut()}>Sign Out</button>
}

export default SignOut;