
'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function CustomSessionProvider({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
