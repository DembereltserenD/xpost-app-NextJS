import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate, markdownToHtml } from "@/lib/utils";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import { Eye, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock function to get article by slug
const getArticleBySlug = async (slug: string) => {
  // Mock article data - in a real app this would come from Supabase
  const articles = [
    {
      id: "1",
      slug: "mongolia-strengthens-economic-ties",
      title: "Mongolia Strengthens Economic Ties with Neighboring Countries",
      excerpt:
        "New trade agreements set to boost Mongolia's economy and create opportunities for local businesses.",
      content: `# Mongolia Strengthens Economic Ties with Neighboring Countries

Mongolia has taken significant steps to strengthen its economic relationships with neighboring countries, marking a new era of cooperation and growth for the landlocked nation.

## New Trade Agreements

The government has recently signed several bilateral trade agreements that are expected to:

- Increase export opportunities for Mongolian businesses
- Attract foreign investment in key sectors
- Create thousands of new jobs across the country
- Boost GDP growth by an estimated 3-5% over the next two years

## Impact on Local Businesses

Local entrepreneurs are already seeing the benefits of these new partnerships. **Small and medium enterprises** are particularly well-positioned to take advantage of the expanded market access.

> "This is a game-changer for our economy. We're finally seeing the international recognition Mongolia deserves," said Minister of Foreign Affairs.

## Looking Forward

The success of these initiatives will depend on continued cooperation and the implementation of supporting infrastructure projects currently in development.`,
      featured_image:
        "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80",
      published_at: "2023-05-15T09:00:00Z",
      views: 1240,
      comment_count: 32,
      categories: { name: "Politics", slug: "politics" },
      authors: {
        name: "Bat-Erdene Batbold",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bat",
        bio: "Senior political correspondent with over 10 years of experience covering Mongolian politics and international relations.",
      },
      tags: ["economy", "trade", "international"],
    },
    {
      id: "2",
      slug: "tech-startups-ulaanbaatar-growth",
      title: "Tech Startups in Ulaanbaatar See Record Growth",
      excerpt:
        "Local tech ecosystem flourishes as investment in Mongolian startups reaches all-time high.",
      content: `# Tech Startups in Ulaanbaatar See Record Growth

The capital city's technology sector is experiencing unprecedented growth, with startup funding reaching record levels this quarter.

## Investment Surge

Venture capital firms have invested over $50 million in Mongolian startups this year alone, representing a 300% increase from the previous year.

### Key Sectors

- **Fintech**: Digital payment solutions
- **E-commerce**: Online retail platforms
- **EdTech**: Educational technology solutions
- **AgriTech**: Agricultural innovation

## Success Stories

Several local startups have already achieved significant milestones, with some expanding to international markets.

*The future looks bright for Mongolia's tech ecosystem.*`,
      featured_image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      published_at: "2023-05-12T14:30:00Z",
      views: 856,
      comment_count: 18,
      categories: { name: "Technology", slug: "technology" },
      authors: {
        name: "Oyunbileg Tsend",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oyun",
        bio: "Technology journalist and startup ecosystem advocate based in Ulaanbaatar.",
      },
      tags: ["startups", "technology", "investment"],
    },
  ];

  const article = articles.find((a) => a.slug === slug);
  return article
    ? { data: article, error: null }
    : { data: null, error: "Not found" };
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { data: article } = await getArticleBySlug(params.slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
      type: "article",
      publishedTime: article.published_at,
      authors: [article.authors?.name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: article, error } = await getArticleBySlug(params.slug);

  if (!article || error) {
    notFound();
  }

  const content = markdownToHtml(article.content);

  return (
    <div className="max-w-content mx-auto px-4 py-8 bg-background">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {article.categories && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-primary bg-primary/10">
                {article.categories.name}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-6 text-muted-foreground">
              {article.authors && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.authors.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
            </div>
            <ShareButton title={article.title} />
          </div>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div
          className="article-content prose prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-card text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/10 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {article.authors?.bio && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              {article.authors.avatar_url && (
                <Image
                  src={article.authors.avatar_url}
                  alt={article.authors.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  About {article.authors.name}
                </h3>
                <p className="text-card-foreground">{article.authors.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection articleId={article.id} />
      </article>
    </div>
  );
}
