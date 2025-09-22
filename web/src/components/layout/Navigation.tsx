import type { NavigationItem } from '@/types/layout';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface NavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  items, 
  onItemClick, 
  variant = 'horizontal',
  className = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [dropdownButtonRef, setDropdownButtonRef] = useState<HTMLButtonElement | null>(null);

  // Close dropdowns when clicking outside (for horizontal navigation)
  useEffect(() => {
    if (variant === 'horizontal') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        // Check if click is on the main nav or the portal dropdown
        const isClickOnNav = navRef.current && navRef.current.contains(target);
        const isClickOnDropdown = target && (target as Element).closest('[data-dropdown-portal]');
        
        if (!isClickOnNav && !isClickOnDropdown) {
          setExpandedItems(new Set());
          setDropdownPosition(null);
          setDropdownButtonRef(null);
        }
      };

      const handleScroll = () => {
        if (dropdownButtonRef && expandedItems.size > 0) {
          const rect = dropdownButtonRef.getBoundingClientRect();
          const newPosition = {
            top: rect.bottom,
            left: rect.left
          };
          setDropdownPosition(newPosition);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [variant, dropdownButtonRef, expandedItems.size]);

  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(item.href);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        if (variant === 'horizontal') {
          setDropdownPosition(null);
          setDropdownButtonRef(null);
        }
      } else {
        // For horizontal navigation, only allow one dropdown at a time
        if (variant === 'horizontal') {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isItemActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.href.split('?')[0]);
    }
    return location.pathname === item.href.split('?')[0];
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0, isDropdownItem: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isItemActive(item);
    
    
    // For horizontal navigation, don't render nested items inline, but allow them in dropdown
    if (variant === 'horizontal' && level > 0 && !isDropdownItem) {
      return null;
    }

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''} ${variant === 'horizontal' ? 'relative z-50' : ''}`}>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={(e) => {
              if (hasChildren) {
                if (variant === 'horizontal') {
                  // Store button reference for scroll updates
                  setDropdownButtonRef(e.currentTarget);
                  // Calculate position for dropdown
                  const rect = e.currentTarget.getBoundingClientRect();
                  const initialPosition = {
                    top: rect.bottom,
                    left: rect.left
                  };
                  setDropdownPosition(initialPosition);
                  toggleExpanded(item.id);
                } else {
                  // For vertical navigation, prevent default and just toggle expansion
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }
              } else {
                handleItemClick(item);
                // Close dropdown after clicking sub-menu item in horizontal navigation
                if (variant === 'horizontal') {
                  setExpandedItems(new Set());
                  setDropdownPosition(null);
                  setDropdownButtonRef(null);
                }
              }
            }}
            className={`
              ${variant === 'horizontal' 
                ? level > 0 
                  ? 'px-4 py-2 text-sm w-full justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none -mx-4' 
                  : 'px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base'
                : 'px-3 py-2.5 justify-start text-sm sm:text-base w-full'
              }
              ${level === 0 ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
              transition-colors duration-200
              font-medium text-gray-700 dark:text-gray-300
              hover:text-gray-900 dark:hover:text-white
              ${isActive && level === 0 ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : ''}
              ${variant === 'vertical' ? 'w-full' : 'sm:w-auto'}
            `}
          >
            {item.icon && <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
            <span className="truncate">{item.label}</span>
            {hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </Button>
          
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && variant === 'vertical' && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavigationItem(child, level + 1, false))}
          </div>
        )}
      </div>
    );
  };

  const baseClasses = variant === 'horizontal' 
    ? 'flex space-x-2 lg:space-x-4' 
    : 'flex flex-col space-y-1';

  return (
    <>
      <nav ref={navRef} className={`${baseClasses} ${className}`} role="navigation" aria-label="Main navigation">
        {items.map((item) => renderNavigationItem(item))}
      </nav>
      
        {/* Portal dropdown for horizontal navigation */}
        {variant === 'horizontal' && expandedItems.size > 0 && dropdownPosition && (
          createPortal(
            <div
              data-dropdown-portal
              className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] min-w-48 py-1 overflow-hidden"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {(() => {
                const expandedItem = items.find(item => expandedItems.has(item.id));

                if (!expandedItem || !expandedItem.children) {
                  return null;
                }

                return expandedItem.children.map((child) => renderNavigationItem(child, 1, true));
              })()}
            </div>,
            document.body
          )
        )}
    </>
  );
};
