import type React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Robot } from '@/types/database';
import { Star, ExternalLink, ArrowRight } from 'lucide-react';

interface RobotComparisonCardProps {
  robot: Robot | null;
  robots: Robot[];
  onRobotChange: (robotId: string) => void;
  onRandomize: () => void;
  isLoading?: boolean;
  position: 'left' | 'right';
}

export const RobotComparisonCard: React.FC<RobotComparisonCardProps> = ({
  robot,
  robots,
  onRobotChange,
  onRandomize,
  isLoading = false,
  position
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!robot) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No Robot Selected</p>
            <p className="text-sm">Choose a robot to compare</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={onRandomize} variant="outline">
              Select Random Robot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {robot.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {robot.manufacturer?.name || 'Unknown Manufacturer'}
            </p>
            <div className="flex items-center gap-2 mb-3">
              {robot.rating_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {robot.rating_average.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({robot.rating_count})
                  </span>
                </div>
              )}
              {robot.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Select Robot
            </label>
            <Select value={robot.id} onValueChange={onRobotChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a robot..." />
              </SelectTrigger>
              <SelectContent>
                {robots.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} - {r.manufacturer?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={onRandomize} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Random Robot
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {robot.featured_image_url ? (
            <img
              src={robot.featured_image_url}
              alt={robot.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-robot.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">No Image Available</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {robot.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {robot.description}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {robot.height_cm && (
              <div>
                <span className="text-gray-500">Height:</span>
                <span className="ml-1 font-medium">{robot.height_cm} cm</span>
              </div>
            )}
            {robot.weight_kg && (
              <div>
                <span className="text-gray-500">Weight:</span>
                <span className="ml-1 font-medium">{robot.weight_kg} kg</span>
              </div>
            )}
            {robot.estimated_price_usd && (
              <div className="col-span-2">
                <span className="text-gray-500">Price:</span>
                <span className="ml-1 font-medium">
                  ${robot.estimated_price_usd.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          {robot.features && robot.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Key Features</h4>
              <div className="flex flex-wrap gap-1">
                {robot.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {robot.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{robot.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open(`/robot/${robot.slug}`, '_blank')}
          >
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
