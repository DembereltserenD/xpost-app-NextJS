-- xpost.mn Database Schema
-- Complete SQL migration for Supabase (Fixed Version)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#1da1f2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authors table
CREATE TABLE authors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('author', 'editor', 'admin')),
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Full-text search indexes
CREATE INDEX idx_articles_search ON articles USING GIN (to_tsvector('english', title || ' ' || content || ' ' || COALESCE(excerpt, '')));
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles 
    SET views = views + 1 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE articles SET comment_count = comment_count - 1 WHERE id = NEW.article_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_comment_count
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid() = owner);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);

-- Row Level Security (RLS) Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
  COALESCE((auth.jwt() ->> 'role')::text, '') = 'admin'
);

-- Authors policies  
CREATE POLICY "Authors are viewable by everyone" ON authors FOR SELECT USING (true);
CREATE POLICY "Authors can update their own profile" ON authors FOR UPDATE USING (
  COALESCE((auth.jwt() ->> 'email')::text, '') = email
);
CREATE POLICY "Only admins can manage authors" ON authors FOR ALL USING (
  COALESCE((auth.jwt() ->> 'role')::text, '') = 'admin'
);

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone" ON articles FOR SELECT USING (
  status = 'published' OR COALESCE((auth.jwt() ->> 'role')::text, '') IN ('admin', 'editor', 'author')
);
CREATE POLICY "Authors can manage their own articles" ON articles FOR ALL USING (
  author_id = (SELECT id FROM authors WHERE email = COALESCE((auth.jwt() ->> 'email')::text, ''))
);
CREATE POLICY "Admins and editors can manage all articles" ON articles FOR ALL USING (
  COALESCE((auth.jwt() ->> 'role')::text, '') IN ('admin', 'editor')
);

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone" ON comments FOR SELECT USING (
  status = 'approved' OR COALESCE((auth.jwt() ->> 'role')::text, '') IN ('admin', 'editor')
);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins and editors can manage comments" ON comments FOR UPDATE USING (
  COALESCE((auth.jwt() ->> 'role')::text, '') IN ('admin', 'editor')
);
CREATE POLICY "Only admins can delete comments" ON comments FOR DELETE USING (
  COALESCE((auth.jwt() ->> 'role')::text, '') = 'admin'
);

-- Insert sample categories
INSERT INTO categories (name, slug, description, color) VALUES
('Politics', 'politics', 'Political news and analysis from Mongolia', '#dc2626'),
('Business', 'business', 'Business and economic news', '#059669'),
('Technology', 'tech', 'Latest technology trends and innovations', '#2563eb'),
('Culture', 'culture', 'Cultural events and traditions', '#7c3aed'),
('Sports', 'sports', 'Sports news and updates', '#ea580c'),
('Health', 'health', 'Health and wellness news', '#16a34a');

-- Insert sample admin author (you'll need to update the email)
INSERT INTO authors (name, email, bio, role, avatar_url) VALUES
('Admin User', 'admin@xpost.mn', 'Administrator of xpost.mn news platform', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('John Doe', 'john@xpost.mn', 'Senior journalist covering politics and current affairs', 'author', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
('Jane Smith', 'jane@xpost.mn', 'Technology reporter and editor', 'editor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane');

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, content, featured_image, category_id, author_id, status, tags, published_at) VALUES
(
  'Welcome to xpost.mn',
  'welcome-to-xpost-mn',
  'Introducing Mongolia''s newest digital news platform, bringing you the latest updates and in-depth analysis.',
  '# Welcome to xpost.mn

We are excited to launch Mongolia''s newest digital news platform. Our mission is to provide accurate, timely, and comprehensive coverage of events that matter to the Mongolian people.

## Our Vision

At xpost.mn, we believe in the power of informed journalism to strengthen democracy and foster meaningful dialogue in our society.

## What We Cover

- **Politics**: In-depth analysis of political developments
- **Business**: Economic trends and market insights
- **Technology**: Innovation and digital transformation
- **Culture**: Preserving and celebrating Mongolian heritage
- **Sports**: Coverage of local and international sports
- **Health**: Wellness and healthcare news

Stay tuned for more updates and thank you for being part of our community!',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  (SELECT id FROM categories WHERE slug = 'politics'),
  (SELECT id FROM authors WHERE email = 'admin@xpost.mn'),
  'published',
  ARRAY['welcome', 'announcement', 'news'],
  NOW() - INTERVAL '1 day'
),
(
  'Digital Transformation in Mongolia',
  'digital-transformation-mongolia',
  'Exploring how technology is reshaping various sectors of the Mongolian economy.',
  '# Digital Transformation in Mongolia

Mongolia is experiencing a significant digital transformation across various sectors. From fintech innovations to e-government initiatives, the country is embracing technology to improve efficiency and accessibility.

## Key Areas of Growth

### Financial Technology
The rise of digital payment systems and mobile banking has revolutionized how Mongolians handle their finances.

### E-Government Services
Government services are becoming more accessible through digital platforms, reducing bureaucracy and improving citizen experience.

### Education Technology
Online learning platforms and digital resources are expanding educational opportunities, especially in remote areas.

## Challenges and Opportunities

While the digital transformation brings numerous benefits, it also presents challenges such as digital literacy and infrastructure development that need to be addressed.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  (SELECT id FROM categories WHERE slug = 'tech'),
  (SELECT id FROM authors WHERE email = 'jane@xpost.mn'),
  'published',
  ARRAY['technology', 'digital', 'mongolia', 'innovation'],
  NOW() - INTERVAL '2 hours'
);

-- Insert sample comments
INSERT INTO comments (article_id, name, email, content, status) VALUES
(
  (SELECT id FROM articles WHERE slug = 'welcome-to-xpost-mn'),
  'Reader One',
  'reader1@example.com',
  'Great to see a new news platform launching! Looking forward to quality journalism.',
  'approved'
),
(
  (SELECT id FROM articles WHERE slug = 'digital-transformation-mongolia'),
  'Tech Enthusiast',
  'tech@example.com',
  'Very insightful article about digital transformation. The points about e-government are particularly interesting.',
  'approved'
);

-- Function to search articles
CREATE OR REPLACE FUNCTION search_articles(search_query TEXT, page_num INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  excerpt TEXT,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER,
  comment_count INTEGER,
  author_name VARCHAR,
  author_avatar_url TEXT,
  category_name VARCHAR,
  category_slug VARCHAR,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.featured_image,
    a.published_at,
    a.views,
    a.comment_count,
    au.name as author_name,
    au.avatar_url as author_avatar_url,
    c.name as category_name,
    c.slug as category_slug,
    a.tags
  FROM articles a
  LEFT JOIN authors au ON a.author_id = au.id
  LEFT JOIN categories c ON a.category_id = c.id
  WHERE a.status = 'published'
    AND (
      to_tsvector('english', a.title || ' ' || a.content || ' ' || COALESCE(a.excerpt, '')) @@ plainto_tsquery('english', search_query)
      OR a.title ILIKE '%' || search_query || '%'
      OR a.content ILIKE '%' || search_query || '%'
      OR search_query = ANY(a.tags)
    )
  ORDER BY a.published_at DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Create a view for published articles with author and category info
CREATE VIEW published_articles AS
SELECT 
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.content,
  a.featured_image,
  a.tags,
  a.views,
  a.comment_count,
  a.published_at,
  a.created_at,
  a.updated_at,
  au.name as author_name,
  au.avatar_url as author_avatar_url,
  au.bio as author_bio,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color
FROM articles a
LEFT JOIN authors au ON a.author_id = au.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.published_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Additional utility functions
CREATE OR REPLACE FUNCTION get_article_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_articles', (SELECT COUNT(*) FROM articles),
    'published_articles', (SELECT COUNT(*) FROM articles WHERE status = 'published'),
    'draft_articles', (SELECT COUNT(*) FROM articles WHERE status = 'draft'),
    'total_views', (SELECT COALESCE(SUM(views), 0) FROM articles),
    'total_comments', (SELECT COUNT(*) FROM comments WHERE status = 'approved'),
    'total_categories', (SELECT COUNT(*) FROM categories),
    'total_authors', (SELECT COUNT(*) FROM authors)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular articles
CREATE OR REPLACE FUNCTION get_popular_articles(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  views INTEGER,
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.title, a.slug, a.views, a.published_at
  FROM articles a
  WHERE a.status = 'published'
    AND a.published_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY a.views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';