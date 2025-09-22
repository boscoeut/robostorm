import { supabase } from '@/lib/supabase';
import type { NewsArticle, NewsFilters, PaginatedResponse } from '@/types/database';

export class NewsService {
  /**
   * Fetch news articles with optional filtering and pagination
   */
  static async getNewsArticles(
    filters: NewsFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<NewsArticle>> {
    try {
      let query = supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .order('published_date', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters.source_name) {
        query = query.eq('source_name', filters.source_name);
      }

      if (filters.date_from) {
        query = query.gte('published_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('published_date', filters.date_to);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching news articles:', error);
      throw error;
    }
  }

  /**
   * Fetch featured news articles
   */
  static async getFeaturedNews(limit: number = 2): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching featured news:', error);
      throw error;
    }
  }

  /**
   * Fetch recent news articles
   */
  static async getRecentNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent news:', error);
      throw error;
    }
  }

  /**
   * Search news articles by title and content
   */
  static async searchNews(
    searchQuery: string,
    limit: number = 10
  ): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  /**
   * Get unique categories from news articles
   */
  static async getNewsCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw error;
      }

      // Extract unique categories
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Error fetching news categories:', error);
      throw error;
    }
  }

  /**
   * Get all unique tags from news articles
   */
  static async getNewsTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('tags')
        .not('tags', 'is', null);

      if (error) {
        throw error;
      }

      // Flatten and get unique tags
      const allTags = data?.flatMap(item => item.tags || []) || [];
      return [...new Set(allTags)];
    } catch (error) {
      console.error('Error fetching news tags:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a news article
   */
  static async incrementViewCount(articleId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_news_view_count', {
        article_id: articleId,
      });

      if (error) {
        // If the RPC doesn't exist, use a regular update
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({ view_count: supabase.raw('view_count + 1') })
          .eq('id', articleId);

        if (updateError) {
          throw updateError;
        }
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw here as this is not critical
    }
  }

  /**
   * Fetch news articles from The Rundown Robotics
   * This method calls the edge function to fetch fresh news from The Rundown Robotics
   */
  static async fetchFromRundownRobotics(): Promise<NewsArticle[]> {
    try {
      // Call the edge function to fetch fresh news
      const { data, error } = await supabase.functions.invoke('fetch-rundown-news', {
        method: 'POST'
      });

      if (error) {
        throw error;
      }

      // After fetching, get the updated articles from the database
      const { data: articles, error: fetchError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('source_name', 'The Rundown Robotics')
        .order('published_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return articles || [];
    } catch (error) {
      console.error('Error fetching from Rundown Robotics:', error);
      throw error;
    }
  }

  /**
   * Add a new news article to the database
   */
  static async addNewsArticle(article: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .insert([article])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding news article:', error);
      throw error;
    }
  }

  /**
   * Update an existing news article
   */
  static async updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating news article:', error);
      throw error;
    }
  }

  /**
   * Delete a news article
   */
  static async deleteNewsArticle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting news article:', error);
      throw error;
    }
  }

  /**
   * Get news statistics
   */
  static async getNewsStats(): Promise<{
    totalArticles: number;
    totalViews: number;
    featuredCount: number;
    categoryCount: number;
  }> {
    try {
      const [articlesResult, viewsResult, featuredResult, categoriesResult] = await Promise.all([
        supabase.from('news_articles').select('id', { count: 'exact', head: true }),
        supabase.from('news_articles').select('view_count'),
        supabase.from('news_articles').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('news_articles').select('category').not('category', 'is', null)
      ]);

      const totalArticles = articlesResult.count || 0;
      const totalViews = viewsResult.data?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;
      const featuredCount = featuredResult.count || 0;
      const uniqueCategories = new Set(categoriesResult.data?.map(item => item.category).filter(Boolean));
      const categoryCount = uniqueCategories.size;

      return {
        totalArticles,
        totalViews,
        featuredCount,
        categoryCount
      };
    } catch (error) {
      console.error('Error fetching news stats:', error);
      throw error;
    }
  }
}
