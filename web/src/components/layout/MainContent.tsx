import type { MainContentProps } from '@/types/layout';

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main 
      className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-auto"
      role="main"
      aria-label="Main content"
    >
      <div className="max-w-7xl mx-auto">
        {/* Content Area */}
        <div className="min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-7rem)] lg:min-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </div>
    </main>
  );
};
