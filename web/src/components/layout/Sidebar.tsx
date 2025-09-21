import type { SidebarProps } from '@/types/layout';
import { Navigation } from './Navigation';
import { useLayoutStore } from '@/stores/layout-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { AuthButton } from '@/components/auth/AuthButton';
import { X, BarChart3, Newspaper } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { navigationItems } = useLayoutStore();

  const sidebarItems = [
    ...navigationItems,
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 sm:w-80 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700 shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none lg:w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-hidden
        `}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Theme Switcher and Auth Button */}
        <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Change Theme
                </span>
              </div>
            </div>
            <div className="w-full">
              <AuthButton variant="mobile" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 overflow-y-auto flex-1">
          <Navigation 
            items={sidebarItems} 
            variant="vertical"
            className="mb-6"
          />       
        </div>
      </aside>
    </>
  );
};
