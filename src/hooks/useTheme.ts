import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('c3_theme') as Theme | null;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (theme === 'dark') {
      root.classList.add('dark');
      if (link) link.href = '/Logo Blanco C3.png?v=2';
    } else {
      root.classList.remove('dark');
      if (link) link.href = '/C3 logo.png?v=2';
    }
    try {
      localStorage.setItem('c3_theme', theme);
    } catch {
      // noop
    }
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle, setTheme };
}
