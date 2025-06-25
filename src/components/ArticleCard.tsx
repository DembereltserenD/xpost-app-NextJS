import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ArticleCardProps {
  article?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featured_image: string;
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
  };
  featured?: boolean;
}

const formatRelativeDate = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

  // Format as MMM dd, yyyy
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ArticleCard({
  article,
  featured = false,
}: ArticleCardProps) {
  // Default article data if none is provided
  const defaultArticle = {
    id: "1",
    slug: "sample-article",
    title: "Sample Article Title",
    excerpt:
      "This is a sample article excerpt that shows what the card looks like when populated with content.",
    featured_image:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    published_at: new Date().toISOString(),
    views: 120,
    comment_count: 5,
    tags: ["news", "technology"],
    categories: {
      name: "Technology",
      slug: "technology",
    },
    authors: {
      name: "John Doe",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
  };

  // Use provided article or default
  const articleData = article || defaultArticle;

  return (
    <Card
      className={`overflow-hidden hover:border-primary/50 transition-all duration-200 bg-card ${featured ? "transform hover:scale-[1.02]" : ""}`}
    >
      <Link href={`/article/${articleData.slug}`} className="block">
        {articleData.featured_image && (
          <div className={`relative ${featured ? "h-64" : "h-48"} bg-muted`}>
            <Image
              src={articleData.featured_image}
              alt={articleData.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardContent className="p-6">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 mb-3">
            {articleData.categories && (
              <Badge variant="secondary" className="text-primary bg-primary/10">
                {articleData.categories.name}
              </Badge>
            )}
            {articleData.tags && articleData.tags.length > 0 && (
              <div className="flex gap-1">
                {articleData.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-muted-foreground text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h2
            className={`font-semibold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors ${featured ? "text-2xl" : "text-lg"}`}
          >
            {articleData.title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {articleData.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {articleData.authors && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    {articleData.authors.avatar_url && (
                      <AvatarImage
                        src={articleData.authors.avatar_url}
                        alt={articleData.authors.name}
                      />
                    )}
                    <AvatarFallback>
                      {articleData.authors.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{articleData.authors.name}</span>
                </div>
              )}
              <span>{formatRelativeDate(articleData.published_at)}</span>
            </div>

            <div className="flex items-center gap-3">
              {articleData.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{articleData.views}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{articleData.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
