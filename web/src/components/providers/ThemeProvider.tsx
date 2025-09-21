import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    // Apply theme to document body
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};
