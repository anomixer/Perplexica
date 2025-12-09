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
    
    // 確保初始主題正確設置
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      // 檢查瀏覽器偏好
      let initialTheme = 'dark';
      if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialTheme = 'dark';
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          initialTheme = 'light';
        }
      }
      localStorage.setItem('theme', initialTheme);
    }
  }, []);

  // 防止 hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider 
      attribute="class" 
      enableSystem={true}  // 改為支持系統偏好
      defaultTheme="dark"
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
