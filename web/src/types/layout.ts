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
  currentRoute: string;
  navigationItems: NavigationItem[];
}

export interface LayoutActions {
  setCurrentRoute: (route: string) => void;
  setNavigationItems: (items: NavigationItem[]) => void;
  updateNavigationForAuth: (isAuthenticated: boolean, isAdmin: boolean) => void;
}

export interface AppLayoutProps {
  children: React.ReactNode;
}

export interface HeaderProps {}

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
