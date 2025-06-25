import React from "react";
import ArticleCard from "./ArticleCard";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  views: number;
  comment_count: number;
  tags?: string[];
  categories?: {
    name: string;
    slug: string;
  };
  authors?: {
    name: string;
    avatar_url?: string;
  };
}

interface ArticleGridProps {
  articles?: Article[];
  featuredArticleId?: string;
  title?: string;
  className?: string;
}

export default function ArticleGrid({
  articles = [],
  featuredArticleId,
  title,
  className = "",
}: ArticleGridProps) {
  // Find featured article if featuredArticleId is provided
  const featuredArticle = featuredArticleId
    ? articles.find((article) => article.id === featuredArticleId)
    : articles[0]; // Default to first article if no ID provided

  // Filter out the featured article from regular articles
  const regularArticles = featuredArticle
    ? articles.filter((article) => article.id !== featuredArticle.id)
    : articles.slice(1); // Skip first article if no specific featured article

  return (
    <div className={`w-full bg-background ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      )}

      <div className="space-y-8">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-8">
            <ArticleCard article={featuredArticle} featured={true} />
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
