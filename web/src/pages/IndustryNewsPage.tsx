import React from 'react';
import { Newspaper, Clock, TrendingUp, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const IndustryNewsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Newspaper className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Industry News
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Stay updated with the latest developments, breakthroughs, and trends in humanoid robotics. 
          From research announcements to product launches and industry insights.
        </p>
      </div>

      {/* News Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            'Latest News',
            'Product Launches',
            'Research & Development',
            'Industry Analysis',
            'Company Updates',
            'Events & Conferences'
          ].map((category) => (
            <Badge key={category} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured News */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2" />
          Featured Stories
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              title: 'Boston Dynamics Unveils Next-Generation Atlas Robot',
              summary: 'The latest iteration of Atlas showcases improved mobility and AI capabilities, marking a significant step forward in humanoid robotics.',
              category: 'Product Launch',
              date: '2025-09-18',
              readTime: '5 min read',
              featured: true
            },
            {
              title: 'Tesla Bot Production Timeline Announced',
              summary: 'Elon Musk reveals updated plans for Optimus humanoid robot manufacturing and potential commercial applications.',
              category: 'Company Update',
              date: '2025-09-17',
              readTime: '3 min read',
              featured: true
            }
          ].map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <Newspaper className="h-16 w-16 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {article.date}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    Read More
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent News List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Updates</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Honda Announces ASIMO Successor Program',
              summary: 'Japanese automaker reveals plans for next-generation humanoid robot with enhanced AI capabilities.',
              category: 'R&D',
              date: '2025-09-16',
              readTime: '4 min read'
            },
            {
              title: 'Robotics Market Projected to Reach $165B by 2030',
              summary: 'New industry report highlights exponential growth in humanoid robotics sector driven by AI advances.',
              category: 'Industry Analysis',
              date: '2025-09-15',
              readTime: '6 min read'
            },
            {
              title: 'World Robotics Conference 2025 Highlights',
              summary: 'Key takeaways from the largest robotics conference, featuring breakthrough demonstrations and partnerships.',
              category: 'Events',
              date: '2025-09-14',
              readTime: '8 min read'
            },
            {
              title: 'SoftBank Robotics Pepper 2.0 Beta Testing',
              summary: 'Limited beta program launches for improved social robot with advanced natural language processing.',
              category: 'Product Launch',
              date: '2025-09-13',
              readTime: '3 min read'
            }
          ].map((article, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Newspaper className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {article.date}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {article.summary}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" disabled className="self-start md:self-center">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="text-center py-8">
        <Card className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <Newspaper className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Stay Informed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for the latest robotics news, research updates, and industry insights 
              delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled
              />
              <Button disabled className="bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
