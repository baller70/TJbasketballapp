
'use client';

import { useEffect, useState } from 'react';
import CustomSessionProvider from './session-provider';
import { ThemeProvider } from '../theme-provider';
import { Toaster } from '@/components/ui/toaster';

interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <CustomSessionProvider>
        {children}
        <Toaster />
      </CustomSessionProvider>
    </ThemeProvider>
  );
}
