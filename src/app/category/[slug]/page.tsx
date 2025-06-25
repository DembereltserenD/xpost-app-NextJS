import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleGrid from "@/components/ArticleGrid";
import { getArticles, getCategories } from "@/lib/supabase";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { data: categories } = await getCategories();
  const category = categories?.find((cat) => cat.slug === params.slug);

  if (!category) {
    return {
      title: "Category Not Found - xpost.mn",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} - xpost.mn`,
    description: `Latest ${category.name.toLowerCase()} news and articles from Mongolia`,
    openGraph: {
      title: `${category.name} - xpost.mn`,
      description: `Latest ${category.name.toLowerCase()} news and articles from Mongolia`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Fetch categories for sidebar
  const { data: categories } = await getCategories();

  // Find the current category
  const currentCategory = categories?.find((cat) => cat.slug === params.slug);

  if (!currentCategory) {
    notFound();
  }

  // Fetch articles for this category
  const { data: articles, error } = await getArticles(20, 0, params.slug);

  if (error) {
    console.error("Error fetching articles:", error);
  }

  // Mock data fallback for development
  const mockArticles = [
    {
      id: "1",
      slug: "sample-tech-article",
      title: "Latest Technology Trends in Mongolia",
      excerpt:
        "Exploring the cutting-edge technology developments shaping Mongolia's digital future.",
      featured_image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      published_at: new Date().toISOString(),
      views: 245,
      comment_count: 12,
      categories: { name: currentCategory.name, slug: currentCategory.slug },
      authors: {
        name: "Tech Reporter",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
      },
      tags: ["technology", "innovation", "mongolia"],
    },
    {
      id: "2",
      slug: "sample-category-article-2",
      title: `${currentCategory.name} News Update`,
      excerpt: `Latest developments and insights in the ${currentCategory.name.toLowerCase()} sector.`,
      featured_image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      views: 189,
      comment_count: 8,
      categories: { name: currentCategory.name, slug: currentCategory.slug },
      authors: {
        name: "News Editor",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor",
      },
      tags: [currentCategory.slug, "news", "update"],
    },
  ];

  // Use real data if available, otherwise use mock data
  const displayArticles =
    articles && articles.length > 0 ? articles : mockArticles;

  return (
    <div className="max-w-content mx-auto px-4 py-8 bg-background min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">{currentCategory.name}</span>
        </div>
      </nav>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {currentCategory.name}
            </h1>
            <p className="text-muted-foreground">
              Latest {currentCategory.name.toLowerCase()} news and articles from
              Mongolia
            </p>
          </div>

          {/* Articles */}
          <ArticleGrid articles={displayArticles} className="" />

          {/* Load More Button (for future pagination) */}
          {displayArticles.length >= 20 && (
            <div className="mt-12 text-center">
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors">
                Load More Articles
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              All Categories
            </h3>
            <div className="space-y-2">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`block py-2 border-b border-border last:border-b-0 transition-colors ${
                    category.slug === params.slug
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {category.name}
                </Link>
              )) || (
                // Fallback categories if none are loaded
                <>
                  <Link
                    href="/category/politics"
                    className={`block py-2 border-b border-border transition-colors ${
                      params.slug === "politics"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Politics
                  </Link>
                  <Link
                    href="/category/business"
                    className={`block py-2 border-b border-border transition-colors ${
                      params.slug === "business"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Business
                  </Link>
                  <Link
                    href="/category/technology"
                    className={`block py-2 border-b border-border transition-colors ${
                      params.slug === "technology"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Technology
                  </Link>
                  <Link
                    href="/category/sports"
                    className={`block py-2 border-b border-border transition-colors ${
                      params.slug === "sports"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Sports
                  </Link>
                  <Link
                    href="/category/entertainment"
                    className={`block py-2 border-b border-border last:border-b-0 transition-colors ${
                      params.slug === "entertainment"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Entertainment
                  </Link>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
