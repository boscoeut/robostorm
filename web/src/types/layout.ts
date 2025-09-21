export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  public?: boolean;
  adminOnly?: boolean;
}

export interface LayoutState {
  sidebarOpen: boolean;
  currentRoute: string;
  navigationItems: NavigationItem[];
}

export interface LayoutActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setNavigationItems: (items: NavigationItem[]) => void;
  updateNavigationForAuth: (isAuthenticated: boolean, isAdmin: boolean) => void;
}

export interface AppLayoutProps {
  children: React.ReactNode;
}

export interface HeaderProps {
  onMenuToggle: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MainContentProps {
  children: React.ReactNode;
}

export interface FooterProps {}

export interface NavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
}
