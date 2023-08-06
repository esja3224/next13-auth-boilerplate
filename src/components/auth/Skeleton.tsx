'use client';

import { TOKEN_STATE } from '@/src/lib/constants';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Skeleton({
  children,
}: {
  children?: React.ReactNode;
}) {
    const { data } = useSession()
    useEffect(() => {
      if (!data?.refresh_token_expiry) return
      if(data?.refresh_token_expiry <= 0 || data?.refresh_token_state === TOKEN_STATE.EXPIRED)
        signOut()
    }, [data?.refresh_token_expiry, data?.refresh_token_state])
    return <div>{children}</div>
}