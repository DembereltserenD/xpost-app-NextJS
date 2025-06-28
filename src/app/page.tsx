"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, MessageCircle, TrendingUp } from "lucide-react";
import DateSorter from "@/components/DateSorter";
import { getArticles, getCategories } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch articles and categories
        const [articlesResult, categoriesResult] = await Promise.all([
          getArticles(20), // Get 20 articles
          getCategories(),
        ]);

        if (articlesResult.error) {
          console.error("Error fetching articles:", articlesResult.error);
          setError("Failed to load articles");
        } else {
          setArticles(articlesResult.data || []);
        }

        if (categoriesResult.error) {
          console.error("Error fetching categories:", categoriesResult.error);
        } else {
          setCategories(categoriesResult.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateSelect = (date: string) => {
    console.log("Selected date:", date);
    // Here you can filter articles by the selected date
    // You can implement the filtering logic based on created_at or published_at
  };

  // Helper function to get category color
  const getCategoryColor = (categoryName: string) => {
    const colors = {
      Technology: "bg-purple-600",
      Business: "bg-green-600",
      "Breaking News": "bg-blue-600",
      Environment: "bg-green-500",
      Finance: "bg-yellow-500",
      Education: "bg-purple-500",
      Sports: "bg-red-600",
      Health: "bg-pink-600",
      Politics: "bg-indigo-600",
      Science: "bg-cyan-600",
    };
    return colors[categoryName] || "bg-gray-600";
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get hero articles (first 3)
  const heroArticles = articles.slice(0, 3).map((article) => ({
    ...article,
    categoryColor: getCategoryColor(article.categories?.name || "General"),
    category: article.categories?.name || "General",
    author: article.authors?.name || "Anonymous",
    featured_image:
      article.featured_image ||
      "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&q=80",
  }));

  // Get trending articles (next 6)
  const trendingArticles = articles.slice(3, 9).map((article) => ({
    ...article,
    category: article.categories?.name || "General",
    time: formatTime(article.published_at || article.created_at),
    image:
      article.featured_image ||
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
  }));

  // Get latest news (next 4)
  const latestNews = articles.slice(9, 13).map((article) => ({
    ...article,
    category: article.categories?.name || "General",
    categoryColor: `text-${getCategoryColor(article.categories?.name || "General").split("-")[1]}-500`,
    time: formatTime(article.published_at || article.created_at),
    image:
      article.featured_image ||
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
  }));

  // Group remaining articles by category
  const categoryNews = {};
  categories.slice(0, 2).forEach((category) => {
    const categoryArticles = articles
      .filter((article) => article.categories?.name === category.name)
      .slice(0, 3)
      .map((article) => ({
        title: article.title,
        subcategory: article.categories?.name || "General",
        time: formatTime(article.published_at || article.created_at),
        slug: article.slug,
      }));

    if (categoryArticles.length > 0) {
      categoryNews[category.name] = categoryArticles;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Advertisement Space */}
      <div className="bg-gray-100 dark:bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24 flex items-center justify-center text-muted-foreground">
            Advertisement Space
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Main Featured Article */}
          <div className="lg:col-span-2">
            <Link
              href={`/article/${heroArticles[0].slug}`}
              className="block group"
            >
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={heroArticles[0].featured_image}
                  alt={heroArticles[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <Badge
                    className={`${heroArticles[0].categoryColor} text-white mb-3`}
                  >
                    {heroArticles[0].category}
                  </Badge>
                  <h1 className="text-3xl font-bold mb-3 leading-tight">
                    {heroArticles[0].title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      June 24, 2025 • 06:45 AM
                    </span>
                    <span>By {heroArticles[0].author}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Side Articles */}
          <div className="space-y-6">
            {heroArticles.slice(1).map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block group"
              >
                <div className="relative h-44 rounded-lg overflow-hidden">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge
                      className={`${article.categoryColor} text-white mb-2 text-xs`}
                    >
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold text-sm leading-tight mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center text-xs opacity-90">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        June 24, 2025 •{" "}
                        {article.published_at.split("T")[1].slice(0, 5)} AM
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Date Sorter */}
        <div className="flex justify-center mb-8">
          <DateSorter onDateSelect={handleDateSelect} />
        </div>

        {/* Trending Now Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              Trending Now
            </h2>
            <Link href="/trending" className="text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingArticles.slice(0, 4).map((article) => (
              <div key={article.id} className="group cursor-pointer">
                <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{article.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest News Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestNews.map((article) => (
              <div
                key={article.id}
                className="flex space-x-4 group cursor-pointer"
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${article.categoryColor} border-current`}
                  >
                    {article.category}
                  </Badge>
                  <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{article.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {Object.entries(categoryNews).map(([category, articles]) => (
            <section key={category}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {category}
                </h2>
                <Link
                  href={`/category/${category.toLowerCase()}`}
                  className="text-primary hover:underline text-sm"
                >
                  More
                </Link>
              </div>
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div
                    key={index}
                    className="border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-2">
                          {article.subcategory}
                        </Badge>
                        <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors cursor-pointer">
                          {article.title}
                        </h3>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {article.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Advertisement Space */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-8 mb-8">
          <div className="text-center text-muted-foreground">
            Advertisement Space (970×250)
          </div>
        </div>
      </div>
    </div>
  );
}
