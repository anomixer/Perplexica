'use client';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import Select from '../ui/Select';

type Theme = 'dark' | 'light' | 'system';

const ThemeSwitcher = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const isTheme = useCallback((t: Theme) => t === theme, [theme]);

  const handleThemeSwitch = (newTheme: Theme) => {
    setTheme(newTheme);
    // 同步到 localStorage（next-themes 會自動處理，但我們明確保存）
    localStorage.setItem('theme', newTheme);
    
    // 觸發自定義事件通知其他組件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('client-config-changed'));
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTheme('system')) {
      const preferDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)',
      );

      const detectThemeChange = (event: MediaQueryListEvent) => {
        // 系統模式下觸發事件讓其他組件知道
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('client-config-changed'));
        }
      };

      preferDarkScheme.addEventListener('change', detectThemeChange);

      return () => {
        preferDarkScheme.removeEventListener('change', detectThemeChange);
      };
    }
  }, [isTheme, setTheme, theme]);

  // 避免 Hydration Mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Select
      className={className}
      value={theme}
      onChange={(e) => handleThemeSwitch(e.target.value as Theme)}
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ]}
    />
  );
};

export default ThemeSwitcher;
