"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { searchArticles, getCategories } from "@/lib/supabase";

interface Article {
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
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ARTICLES_PER_PAGE = 12;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [sortBy, setSortBy] = useState("relevance");

  // Mock data for when Supabase is not connected
  const mockArticles: Article[] = [
    {
      id: "1",
      slug: "sample-search-result-1",
      title: "Search Result: Technology Innovation in Mongolia",
      excerpt:
        "This article discusses the latest technological innovations happening in Mongolia and their impact on the economy.",
      featured_image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      views: 245,
      comment_count: 12,
      tags: ["technology", "innovation"],
      categories: { name: "Technology", slug: "technology" },
      authors: {
        name: "Tech Reporter",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
      },
    },
    {
      id: "2",
      slug: "sample-search-result-2",
      title: "Search Result: Economic Development News",
      excerpt:
        "Latest updates on Mongolia's economic development and growth prospects for the coming year.",
      featured_image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      published_at: new Date(Date.now() - 172800000).toISOString(),
      views: 189,
      comment_count: 8,
      tags: ["economy", "development"],
      categories: { name: "Business", slug: "business" },
      authors: {
        name: "Business Writer",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=business",
      },
    },
    {
      id: "3",
      slug: "sample-search-result-3",
      title: "Search Result: Cultural Heritage Preservation",
      excerpt:
        "Exploring efforts to preserve Mongolia's rich cultural heritage in the modern era.",
      featured_image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      published_at: new Date(Date.now() - 259200000).toISOString(),
      views: 156,
      comment_count: 15,
      tags: ["culture", "heritage"],
      categories: { name: "Culture", slug: "culture" },
      authors: {
        name: "Culture Editor",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=culture",
      },
    },
  ];

  const mockCategories: Category[] = [
    { id: "1", name: "Technology", slug: "technology" },
    { id: "2", name: "Business", slug: "business" },
    { id: "3", name: "Culture", slug: "culture" },
    { id: "4", name: "Politics", slug: "politics" },
    { id: "5", name: "Sports", slug: "sports" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } =
          await getCategories();
        if (!categoriesError && categoriesData) {
          setCategories(categoriesData);
        } else {
          setCategories(mockCategories);
        }

        // Perform search if query exists
        if (query.trim()) {
          const { data: searchData, error: searchError } =
            await searchArticles(query);
          if (!searchError && searchData) {
            let filteredArticles = searchData;

            // Apply category filter
            if (selectedCategory && selectedCategory !== "all") {
              filteredArticles = searchData.filter(
                (article: Article) =>
                  article.categories?.slug === selectedCategory,
              );
            }

            setArticles(filteredArticles);
            setTotalResults(filteredArticles.length);
          } else {
            // Use mock data when Supabase is not connected
            let filteredArticles = mockArticles;

            // Apply category filter to mock data
            if (selectedCategory && selectedCategory !== "all") {
              filteredArticles = mockArticles.filter(
                (article) => article.categories?.slug === selectedCategory,
              );
            }

            // Filter by search query
            if (query.trim()) {
              filteredArticles = filteredArticles.filter(
                (article) =>
                  article.title.toLowerCase().includes(query.toLowerCase()) ||
                  article.excerpt.toLowerCase().includes(query.toLowerCase()),
              );
            }

            setArticles(filteredArticles);
            setTotalResults(filteredArticles.length);
          }
        } else {
          setArticles([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error("Search error:", error);
        // Fallback to mock data
        setCategories(mockCategories);
        if (query.trim()) {
          let filteredArticles = mockArticles.filter(
            (article) =>
              article.title.toLowerCase().includes(query.toLowerCase()) ||
              article.excerpt.toLowerCase().includes(query.toLowerCase()),
          );

          if (selectedCategory && selectedCategory !== "all") {
            filteredArticles = filteredArticles.filter(
              (article) => article.categories?.slug === selectedCategory,
            );
          }

          setArticles(filteredArticles);
          setTotalResults(filteredArticles.length);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, selectedCategory]);

  const totalPages = Math.ceil(totalResults / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  const clearFilters = () => {
    setSelectedCategory("");
    setSortBy("relevance");
  };

  const buildSearchUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    return `/search?${searchParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {query ? `Search Results for "${query}"` : "Search Articles"}
          </h1>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* Filters and Results Info */}
        {query && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {loading ? "Searching..." : `${totalResults} results found`}
                </span>

                {((selectedCategory && selectedCategory !== "all") ||
                  sortBy !== "relevance") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) =>
                    setSelectedCategory(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.slug || category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategory && selectedCategory !== "all" && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {
                    categories.find((cat) => cat.slug === selectedCategory)
                      ?.name
                  }
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
            <span className="ml-2 text-muted-foreground">
              Searching articles...
            </span>
          </div>
        ) : query && articles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No results found
            </h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or removing filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : query && articles.length > 0 ? (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={buildSearchUrl({
                            page: (currentPage - 1).toString(),
                            category: selectedCategory,
                          })}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2,
                      )
                      .map((page, index, array) => {
                        const showEllipsis =
                          index > 0 && array[index - 1] !== page - 1;
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <PaginationItem>
                                <span className="px-3 py-2 text-muted-foreground">
                                  ...
                                </span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href={buildSearchUrl({
                                  page: page.toString(),
                                  category: selectedCategory,
                                })}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={buildSearchUrl({
                            page: (currentPage + 1).toString(),
                            category: selectedCategory,
                          })}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Search for articles
            </h2>
            <p className="text-muted-foreground">
              Enter a search term above to find relevant articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
