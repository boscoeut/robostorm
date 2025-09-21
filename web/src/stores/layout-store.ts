import { create } from 'zustand';
import type { LayoutState, LayoutActions, NavigationItem } from '@/types/layout';

const allNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    public: true,
  },
  {
    id: 'robots',
    label: 'Robot Database',
    href: '/robots',
    public: true,
  },
  {
    id: 'news',
    label: 'Industry News',
    href: '/news',
    public: true,
  },
  {
    id: 'admin',
    label: 'Admin Dashboard',
    href: '/admin',
    public: false,
    adminOnly: true,
  },
];

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  // State
  sidebarOpen: false,
  currentRoute: '/',
  navigationItems: allNavigationItems.filter(item => item.public),

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setCurrentRoute: (route: string) => set({ currentRoute: route }),
  
  setNavigationItems: (items: NavigationItem[]) => set({ navigationItems: items }),

  // Filter navigation items based on authentication status
  updateNavigationForAuth: (isAuthenticated: boolean, isAdmin: boolean) => {
    const filteredItems = allNavigationItems.filter(item => {
      if (item.public) return true;
      if (!isAuthenticated) return false;
      if (item.adminOnly && !isAdmin) return false;
      return true;
    });
    set({ navigationItems: filteredItems });
  },
}));
