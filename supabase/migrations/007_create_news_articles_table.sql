-- Create news_articles table for industry news feed
-- This table stores news articles from various sources including The Rundown Robotics

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(1000) NOT NULL,
    content TEXT,
    summary VARCHAR(1000),
    source_url VARCHAR(1000),
    source_name VARCHAR(500),
    published_date TIMESTAMPTZ,
    category VARCHAR(200),
    tags TEXT[] DEFAULT '{}',
    image_url VARCHAR(1000),
    image_path VARCHAR(500),
    image_name VARCHAR(255),
    image_size INTEGER,
    image_width INTEGER,
    image_height INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_name ON news_articles(source_name);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_featured ON news_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_articles_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_articles_title_gin ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_articles_content_gin ON news_articles USING GIN(to_tsvector('english', content));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_news_articles_updated_at();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_news_view_count(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles 
    SET view_count = view_count + 1 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample news articles from The Rundown Robotics
INSERT INTO news_articles (
    title,
    content,
    summary,
    source_url,
    source_name,
    published_date,
    category,
    tags,
    image_url,
    is_featured
) VALUES 
(
    'Figure soars to $39B valuation',
    'Figure AI has reached a staggering $39 billion valuation, marking one of the largest valuations in the robotics industry. The company has been making significant strides in humanoid robotics, with their Figure 01 robot demonstrating advanced capabilities in manipulation and autonomous operation.',
    'Figure AI reaches $39B valuation, becoming one of the most valuable robotics companies in the world.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '1 day',
    'Valuation',
    ARRAY['valuation', 'figure', 'funding', 'humanoid-robotics'],
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    true
),
(
    'Zoox launches driverless robotaxi service',
    'Amazon-owned Zoox has officially launched its driverless robotaxi service, marking a significant milestone in autonomous vehicle technology. The service operates in select areas and represents years of development in self-driving technology.',
    'Zoox launches its long-awaited driverless robotaxi service, bringing autonomous vehicles to public roads.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '2 days',
    'Autonomous Vehicles',
    ARRAY['autonomous-vehicles', 'zoox', 'amazon', 'robotaxi'],
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    true
),
(
    'Tesla offers Musk $1 trillion pay raise',
    'Tesla has proposed a massive compensation package for CEO Elon Musk worth up to $1 trillion, tied to the company''s performance in AI and robotics development, particularly their Optimus humanoid robot project.',
    'Tesla proposes a $1 trillion compensation package for Elon Musk, tied to AI and robotics milestones.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '3 days',
    'Leadership',
    ARRAY['tesla', 'musk', 'compensation', 'optimus', 'ai'],
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    false
),
(
    'Nvidia''s palm-sized ''robot brain''',
    'Nvidia has unveiled a new palm-sized AI chip specifically designed for robotics applications. This compact yet powerful processor is being hailed as a ''robot brain'' that could revolutionize how robots process information and make decisions.',
    'Nvidia introduces a compact AI chip designed specifically for robotics, dubbed the ''robot brain''.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '4 days',
    'Hardware',
    ARRAY['nvidia', 'ai-chip', 'robotics', 'hardware'],
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    false
),
(
    'Figure 02 now folds laundry',
    'Figure''s latest robot, Figure 02, has demonstrated the ability to fold laundry autonomously. This represents a significant step forward in domestic robotics and shows the practical applications of humanoid robots in everyday tasks.',
    'Figure 02 robot successfully demonstrates autonomous laundry folding capabilities.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '5 days',
    'Capabilities',
    ARRAY['figure', 'domestic-robotics', 'laundry', 'automation'],
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    false
),
(
    'Unitree''s $6K humanoid for everyone',
    'Unitree has announced a new humanoid robot priced at just $6,000, making humanoid robotics more accessible to the general public. This represents a significant price reduction in the humanoid robotics market.',
    'Unitree announces an affordable $6,000 humanoid robot, democratizing access to humanoid robotics.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '6 days',
    'Affordability',
    ARRAY['unitree', 'affordable', 'humanoid', 'price'],
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
    false
),
(
    'China opens world''s first robot mall',
    'China has opened the world''s first fully automated robot mall, where robots handle everything from customer service to inventory management. This represents a major milestone in retail automation.',
    'China launches the world''s first fully automated robot mall, showcasing advanced retail robotics.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '7 days',
    'Retail',
    ARRAY['china', 'retail', 'automation', 'mall'],
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    false
),
(
    'Atlas humanoid now learns by watching',
    'Boston Dynamics'' Atlas robot has been upgraded with the ability to learn new tasks by observing human demonstrations. This represents a major advancement in robot learning and adaptation capabilities.',
    'Boston Dynamics Atlas robot gains the ability to learn new tasks through observation.',
    'https://robotnews.therundown.ai/',
    'The Rundown Robotics',
    NOW() - INTERVAL '8 days',
    'AI Learning',
    ARRAY['atlas', 'boston-dynamics', 'learning', 'demonstration'],
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
    false
);

-- Create RLS policies for news articles
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news articles
CREATE POLICY "Allow public read access to news articles" ON news_articles
    FOR SELECT USING (true);

-- Allow authenticated users to insert news articles (for admin functionality)
CREATE POLICY "Allow authenticated users to insert news articles" ON news_articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update news articles
CREATE POLICY "Allow authenticated users to update news articles" ON news_articles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete news articles
CREATE POLICY "Allow authenticated users to delete news articles" ON news_articles
    FOR DELETE USING (auth.role() = 'authenticated');
