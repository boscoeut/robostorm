import type { NavigationItem } from '@/types/layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(item.href);
    }
  };

  const baseClasses = variant === 'horizontal' 
    ? 'flex space-x-2 lg:space-x-4' 
    : 'flex flex-col space-y-1';

  return (
    <nav className={`${baseClasses} ${className}`} role="navigation" aria-label="Main navigation">
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => handleItemClick(item)}
          className={`
            ${variant === 'horizontal' 
              ? 'px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base' 
              : 'px-3 py-2.5 justify-start text-sm sm:text-base'
            }
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-200
            font-medium text-gray-700 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
            w-full sm:w-auto
          `}
        >
          {item.icon && <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
          <span className="truncate">{item.label}</span>
        </Button>
      ))}
    </nav>
  );
};
