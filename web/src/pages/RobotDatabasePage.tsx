import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Bot, Star, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface Robot {
  id: string;
  name: string;
  slug: string;
  manufacturer_name: string;
  height_cm?: number;
  weight_kg?: number;
  release_date?: string;
  status: string;
  availability_status?: string;
  estimated_price_usd?: number;
  description?: string;
  featured_image_url?: string;
  is_featured: boolean;
  is_verified: boolean;
  is_prototype: boolean;
  rating_average: number;
  rating_count: number;
}

export const RobotDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('robots')
        .select(`
          id,
          name,
          slug,
          height_cm,
          weight_kg,
          release_date,
          status,
          availability_status,
          estimated_price_usd,
          description,
          featured_image_url,
          is_featured,
          is_verified,
          is_prototype,
          rating_average,
          rating_count,
          manufacturers!inner(name)
        `)
        .in('status', ['active', 'development', 'discontinued'])
        .order('is_featured', { ascending: false })
        .order('rating_average', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include manufacturer_name
      const transformedRobots = data.map(robot => ({
        ...robot,
        manufacturer_name: robot.manufacturers.name
      }));

      setRobots(transformedRobots);
    } catch (err) {
      console.error('Error fetching robots:', err);
      setError('Failed to load robots');
    } finally {
      setLoading(false);
    }
  };

  const handleRobotClick = (robotSlug: string) => {
    navigate(`/robot/${robotSlug}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'development': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'discontinued': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Robot Database
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover and explore our comprehensive collection of humanoid robots from around the world. 
          Search by specifications, compare features, and find the perfect robot for your needs.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter Robots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search robots by name, manufacturer, or features..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  disabled
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" disabled>
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button variant="outline" disabled>
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Robot Database */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {loading ? 'Loading Robots...' : error ? 'Error Loading Robots' : 'Robot Database'}
        </h2>
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={fetchRobots} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && robots.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No robots found</p>
          </div>
        )}

        {!loading && !error && robots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {robots.map((robot) => (
              <Card 
                key={robot.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                onClick={() => handleRobotClick(robot.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                      {robot.featured_image_url ? (
                        <img 
                          src={robot.featured_image_url} 
                          alt={robot.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Bot className={`h-8 w-8 text-gray-500 ${robot.featured_image_url ? 'hidden' : ''}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                          {robot.name}
                        </h3>
                        <div className="flex items-center space-x-1 ml-2">
                          {robot.is_verified && (
                            <Star className="h-4 w-4 text-blue-500" fill="currentColor" />
                          )}
                          {robot.is_featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {robot.manufacturer_name}
                      </p>
                      {robot.release_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(robot.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {robot.height_cm && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Height:</span>
                        <span className="text-gray-900 dark:text-white">{robot.height_cm} cm</span>
                      </div>
                    )}
                    {robot.weight_kg && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                        <span className="text-gray-900 dark:text-white">{robot.weight_kg} kg</span>
                      </div>
                    )}
                    {robot.estimated_price_usd && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatPrice(robot.estimated_price_usd)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(robot.status)} variant="secondary">
                      {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
                    </Badge>
                    {robot.rating_count > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" fill="currentColor" />
                        <span>{robot.rating_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {robot.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                      {robot.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Additional Information */}
      {!loading && !error && robots.length > 0 && (
        <div className="text-center py-8">
          <Card className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Explore Robot Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click on any robot card above to view detailed specifications, features, and comprehensive information about each humanoid robot.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Database contains {robots.length} robots and growing
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
