import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bot, ExternalLink, Star, Eye, Heart, Share2, Calendar, Building, Cpu, Battery, Ruler, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';

interface Robot {
  id: string;
  name: string;
  slug: string;
  manufacturer_name: string;
  manufacturer_slug: string;
  model_number?: string;
  version: string;
  release_date?: string;
  status: string;
  height_cm?: number;
  height_inches?: number;
  weight_kg?: number;
  weight_lbs?: number;
  battery_type?: string;
  battery_life_hours?: number;
  degrees_of_freedom?: number;
  ai_capabilities?: string[];
  operating_system?: string;
  estimated_price_usd?: number;
  availability_status?: string;
  description?: string;
  features?: string[];
  applications?: string[];
  use_cases?: string[];
  featured_image_url?: string;
  gallery_images?: any[];
  video_urls?: any[];
  is_featured: boolean;
  is_verified: boolean;
  is_prototype: boolean;
  view_count: number;
  rating_average: number;
  rating_count: number;
  official_website?: string;
  documentation_url?: string;
  purchase_url?: string;
  wikipedia_url?: string;
}

interface RobotSpecification {
  id: string;
  category: string;
  name: string;
  value: string;
  unit?: string;
  description?: string;
}

export const RobotDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [robot, setRobot] = useState<Robot | null>(null);
  const [specifications, setSpecifications] = useState<RobotSpecification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (slug) {
      fetchRobotData(slug);
    }
  }, [slug]);

  const fetchRobotData = async (robotSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch robot data with manufacturer information
      const { data: robotData, error: robotError } = await supabase
        .from('robots')
        .select(`
          *,
          manufacturers!inner(name, slug)
        `)
        .eq('slug', robotSlug)
        .single();

      if (robotError) {
        if (robotError.code === 'PGRST116') {
          setError('Robot not found');
        } else {
          setError('Failed to load robot data');
        }
        return;
      }

      // Transform the data to match our interface
      const transformedRobot: Robot = {
        ...robotData,
        manufacturer_name: robotData.manufacturers.name,
        manufacturer_slug: robotData.manufacturers.slug,
      };

      setRobot(transformedRobot);

      // Fetch specifications
      const { data: specsData, error: specsError } = await supabase
        .from('robot_specifications')
        .select('*')
        .eq('robot_id', robotData.id)
        .order('category, sort_order');

      if (!specsError && specsData) {
        setSpecifications(specsData);
      }

      // Update view count
      await supabase
        .from('robots')
        .update({ view_count: robotData.view_count + 1 })
        .eq('id', robotData.id);

    } catch (err) {
      console.error('Error fetching robot data:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'development': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'discontinued': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'prototype': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'limited': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'pre-order': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'discontinued': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const groupSpecificationsByCategory = (specs: RobotSpecification[]) => {
    return specs.reduce((groups, spec) => {
      const category = spec.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(spec);
      return groups;
    }, {} as Record<string, RobotSpecification[]>);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Robot Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate('/robots')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Robot Database
          </Button>
        </div>
      </div>
    );
  }

  if (!robot) {
    return null;
  }

  const specificationGroups = groupSpecificationsByCategory(specifications);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/robots" className="hover:text-gray-900 dark:hover:text-white">Robot Database</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{robot.name}</span>
      </nav>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/robots')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Robot Database
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    {robot.featured_image_url ? (
                      <img 
                        src={robot.featured_image_url} 
                        alt={robot.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={robot.featured_image_url ? 'hidden' : ''}>
                      <Bot className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {robot.name}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                        by <Link 
                          to={`/manufacturer/${robot.manufacturer_slug}`} 
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {robot.manufacturer_name}
                        </Link>
                      </p>
                      {robot.model_number && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                          Model: {robot.model_number} • Version: {robot.version}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {robot.is_verified && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {robot.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {robot.is_prototype && (
                        <Badge variant="outline">Prototype</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStatusColor(robot.status)}>
                      {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
                    </Badge>
                    {robot.availability_status && (
                      <Badge className={getAvailabilityColor(robot.availability_status)}>
                        {robot.availability_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                    {robot.release_date && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Released {new Date(robot.release_date).getFullYear()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {robot.view_count.toLocaleString()} views
                    </div>
                    {robot.rating_count > 0 && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {robot.rating_average.toFixed(1)} ({robot.rating_count} reviews)
                      </div>
                    )}
                  </div>
                  
                  {robot.estimated_price_usd && (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                      {formatPrice(robot.estimated_price_usd)}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {robot.official_website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={robot.official_website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Official Site
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {['overview', 'specifications', 'media'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {robot.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">{robot.description}</p>
                  </CardContent>
                </Card>
              )}

              {robot.features && robot.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {robot.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {robot.applications && robot.applications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {robot.applications.map((application, index) => (
                        <Badge key={index} variant="secondary">
                          {application}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {robot.ai_capabilities && robot.ai_capabilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {robot.ai_capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline">
                          <Cpu className="h-3 w-3 mr-1" />
                          {capability.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-6">
              {Object.entries(specificationGroups).map(([category, specs]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {specs.map((spec) => (
                        <div key={spec.id} className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">{spec.name}:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {spec.value} {spec.unit && spec.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Media gallery coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {robot.height_cm && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                  </div>
                  <span className="font-medium">{robot.height_cm} cm</span>
                </div>
              )}
              {robot.weight_kg && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Weight className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                  </div>
                  <span className="font-medium">{robot.weight_kg} kg</span>
                </div>
              )}
              {robot.degrees_of_freedom && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">DOF</span>
                  </div>
                  <span className="font-medium">{robot.degrees_of_freedom}</span>
                </div>
              )}
              {robot.battery_type && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Battery className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Battery</span>
                  </div>
                  <span className="font-medium">{robot.battery_type}</span>
                </div>
              )}
              {robot.operating_system && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">OS</span>
                  </div>
                  <span className="font-medium">{robot.operating_system}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>External Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {robot.official_website && (
                <a 
                  href={robot.official_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Website
                </a>
              )}
              {robot.documentation_url && (
                <a 
                  href={robot.documentation_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </a>
              )}
              {robot.purchase_url && (
                <a 
                  href={robot.purchase_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Purchase
                </a>
              )}
              {robot.wikipedia_url && (
                <a 
                  href={robot.wikipedia_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Wikipedia
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
