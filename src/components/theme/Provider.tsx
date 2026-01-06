'use client';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 防止 hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      enableSystem={true}
      defaultTheme="system"
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
