import { create } from 'zustand';
import type { LayoutState, LayoutActions, NavigationItem } from '@/types/layout';
import { BarChart3, Upload, Bot, Users, Settings } from 'lucide-react';

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
    children: [
      {
        id: 'admin-dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: BarChart3,
      },
      {
        id: 'admin-media',
        label: 'Media Management',
        href: '/admin?section=media',
        icon: Upload,
      },
      {
        id: 'admin-robots',
        label: 'Robot Management',
        href: '/admin?section=robots',
        icon: Bot,
      },
      {
        id: 'admin-users',
        label: 'User Management',
        href: '/admin?section=users',
        icon: Users,
      },
      {
        id: 'admin-settings',
        label: 'Settings',
        href: '/admin?section=settings',
        icon: Settings,
      },
    ],
  },
];

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  // State
  sidebarOpen: false,
  desktopSidebarVisible: true, // Desktop sidebar starts visible
  currentRoute: '/',
  navigationItems: allNavigationItems.filter(item => item.public),

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  toggleDesktopSidebar: () => set((state) => ({ desktopSidebarVisible: !state.desktopSidebarVisible })),
  
  setDesktopSidebarVisible: (visible: boolean) => set({ desktopSidebarVisible: visible }),
  
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
