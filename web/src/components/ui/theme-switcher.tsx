import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useAppStore } from '@/stores/app-store';

export const ThemeSwitcher = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="p-2 h-9 w-9 rounded-md"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
};
