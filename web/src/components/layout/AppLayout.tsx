import type { AppLayoutProps } from '@/types/layout';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { Footer } from './Footer';
import { useLayoutStore } from '@/stores/layout-store';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { updateNavigationForAuth } = useLayoutStore();
  const { user, isAdmin, loading } = useAuth();

  // Update navigation when authentication state changes
  useEffect(() => {
    if (!loading) {
      updateNavigationForAuth(!!user, isAdmin);
    }
  }, [user, isAdmin, loading, updateNavigationForAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <MainContent>
          {children}
        </MainContent>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
