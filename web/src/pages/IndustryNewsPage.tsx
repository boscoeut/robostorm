import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, TrendingUp, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsService } from '@/services/newsService';
import type { NewsArticle } from '@/types/database';

export const IndustryNewsPage: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadNewsData();
  }, []);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured articles, recent articles, and categories in parallel
      const [featured, recent, cats] = await Promise.all([
        NewsService.getFeaturedNews(2),
        NewsService.getRecentNews(10),
        NewsService.getNewsCategories(),
      ]);

      setFeaturedArticles(featured);
      setRecentArticles(recent);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading news data:', err);
      setError('Failed to load news articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory('');
      loadNewsData();
      return;
    }

    try {
      setLoading(true);
      setSelectedCategory(category);
      
      const [featured, recent] = await Promise.all([
        NewsService.getFeaturedNews(2),
        NewsService.getNewsArticles({ category }, 1, 10),
      ]);

      setFeaturedArticles(featured);
      setRecentArticles(recent.data);
    } catch (err) {
      console.error('Error filtering by category:', err);
      setError('Failed to filter articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && featuredArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={loadNewsData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
          <Badge 
            variant={selectedCategory === '' ? "default" : "outline"} 
            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => handleCategoryClick('')}
          >
            All News
          </Badge>
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={selectedCategory === category ? "default" : "outline"} 
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured News */}
      {featuredArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Newspaper className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(article.published_date)}
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
                      {article.source_name || 'Rundown Robotics'}
                    </div>
                    {article.source_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(article.source_url, '_blank')}
                      >
                        Read More
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent News List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Updates</h2>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading articles...</span>
          </div>
        )}
        <div className="space-y-4">
          {recentArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Newspaper className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.published_date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.source_name || 'Rundown Robotics'}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {article.summary}
                    </p>
                  </div>
                  {article.source_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="self-start md:self-center"
                      onClick={() => window.open(article.source_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {recentArticles.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No articles found for the selected category.
          </div>
        )}
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
