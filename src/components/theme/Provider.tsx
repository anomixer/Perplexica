'use client';
import { ThemeProvider } from 'next-themes';

const ThemeProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
