import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Bot, Settings, Upload, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaManager } from '@/components/robot/media/MediaManager';
import { supabase } from '@/lib/supabase';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'dashboard';
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRobots: 0,
    totalMedia: 0,
    totalUsers: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      // Load robots
      const { data: robotsData } = await supabase
        .from('robots')
        .select('id, name, slug, featured_image_url, is_featured, is_verified, view_count')
        .order('created_at', { ascending: false });

      setRobots(robotsData || []);

      // Load stats
      const [robotsCount, mediaCount, usersCount] = await Promise.all([
        supabase.from('robots').select('id', { count: 'exact', head: true }),
        supabase.from('robot_media').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true })
      ]);

      const totalViews = robotsData?.reduce((sum, robot) => sum + (robot.view_count || 0), 0) || 0;

      setStats({
        totalRobots: robotsCount.count || 0,
        totalMedia: mediaCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalViews
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage robots, media, and system settings
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Bot className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Robots</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRobots}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Upload className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Media Files</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalMedia}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Robots */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Robots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {robots.slice(0, 5).map((robot) => (
                      <div key={robot.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {robot.featured_image_url ? (
                            <img
                              src={robot.featured_image_url}
                              alt={robot.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <Bot className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{robot.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {robot.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                            {robot.is_verified && <Badge variant="default" className="text-xs">Verified</Badge>}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {robot.view_count || 0} views
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'media' && (
            <div className="space-y-6">
              {selectedRobot ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Media Management</h2>
                      <p className="text-gray-600">Managing media for: {selectedRobot.name}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRobot(null)}
                    >
                      Back to Robot List
                    </Button>
                  </div>
                  <MediaManager
                    robotId={selectedRobot.id}
                    robotName={selectedRobot.name}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Select a Robot to Manage Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {robots.map((robot) => (
                      <Card
                        key={robot.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedRobot(robot)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {robot.featured_image_url ? (
                                <img
                                  src={robot.featured_image_url}
                                  alt={robot.name}
                                  className="h-16 w-16 object-cover rounded"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <Bot className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{robot.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                {robot.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                                {robot.is_verified && <Badge variant="default" className="text-xs">Verified</Badge>}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{robot.view_count || 0} views</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'robots' && (
            <Card>
              <CardHeader>
                <CardTitle>Robot Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Robot management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>System settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};
