import React from 'react';
import { Search, Filter, Grid, List, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RobotDatabasePage: React.FC = () => {
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

      {/* Featured Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Humanoid Assistants', count: '45+', icon: '🤖' },
            { name: 'Research Platforms', count: '32+', icon: '🔬' },
            { name: 'Entertainment Robots', count: '28+', icon: '🎭' },
            { name: 'Industrial Robots', count: '67+', icon: '🏭' }
          ].map((category) => (
            <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} robots</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Robots Placeholder */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Popular Robots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Atlas', manufacturer: 'Boston Dynamics', height: '1.5m', weight: '89kg' },
            { name: 'Sophia', manufacturer: 'Hanson Robotics', height: '1.62m', weight: '45kg' },
            { name: 'Pepper', manufacturer: 'SoftBank Robotics', height: '1.2m', weight: '28kg' },
            { name: 'ASIMO', manufacturer: 'Honda', height: '1.3m', weight: '50kg' },
            { name: 'NAO', manufacturer: 'Aldebaran Robotics', height: '0.58m', weight: '4.3kg' },
            { name: 'Valkyrie', manufacturer: 'NASA', height: '1.88m', weight: '125kg' }
          ].map((robot) => (
            <Card key={robot.name} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                    <Bot className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{robot.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{robot.manufacturer}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Height:</span>
                    <span className="text-gray-900 dark:text-white">{robot.height}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                    <span className="text-gray-900 dark:text-white">{robot.weight}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="text-center py-8">
        <Card className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Database Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're building the world's most comprehensive humanoid robot database. 
              Stay tuned for detailed specifications, comparisons, and expert reviews.
            </p>
            <Button disabled className="bg-blue-600 hover:bg-blue-700">
              Get Notified
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
