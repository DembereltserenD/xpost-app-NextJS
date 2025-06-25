import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, MessageCircle, TrendingUp } from "lucide-react";

export default function HomePage() {
  // Hero/Featured articles
  const heroArticles = [
    {
      id: "1",
      slug: "global-leaders-climate-summit",
      title:
        "Global Leaders Gather for Climate Summit to Address Urgent Environmental Challenges",
      excerpt:
        "World leaders convene to discuss critical environmental policies and sustainable development goals.",
      featured_image:
        "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&q=80",
      published_at: "2025-06-24T06:45:00Z",
      author: "James Wilson",
      category: "Breaking News",
      categoryColor: "bg-blue-600",
    },
    {
      id: "2",
      slug: "smartphone-features-mobile",
      title: "New Smartphone Features Revolutionize Mobile Experience",
      excerpt:
        "Latest technology innovations transform how we interact with mobile devices.",
      featured_image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      published_at: "2025-06-24T05:30:00Z",
      author: "Tech Reporter",
      category: "Technology",
      categoryColor: "bg-purple-600",
    },
    {
      id: "3",
      slug: "markets-quarterly-reports",
      title: "Markets Rise as Quarterly Reports Exceed Expectations",
      excerpt:
        "Financial markets show strong performance following positive earnings reports.",
      featured_image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      published_at: "2025-06-24T04:15:00Z",
      author: "Financial Analyst",
      category: "Business",
      categoryColor: "bg-green-600",
    },
  ];

  // Trending articles
  const trendingArticles = [
    {
      id: "4",
      title:
        "Quantum Computing Breakthrough Promises New Era of Processing Power",
      category: "Innovations",
      time: "05:20 AM",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
    },
    {
      id: "5",
      title:
        "Next-Generation Wearable Devices Focus on Health Monitoring Capabilities",
      category: "Gadgets",
      time: "04:45 AM",
      image:
        "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&q=80",
    },
    {
      id: "6",
      title:
        "Open Source Projects Gaining Momentum in Enterprise Software Market",
      category: "Software",
      time: "04:10 AM",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
    },
    {
      id: "7",
      title: "Global Stock Markets React to Central Bank Policy Announcements",
      category: "Markets",
      time: "05:05 AM",
      image:
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80",
    },
    {
      id: "8",
      title:
        "Tech Startup Secures Record Funding Round for Sustainable Energy Solution",
      category: "Startups",
      time: "04:30 AM",
      image:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80",
    },
    {
      id: "9",
      title:
        "Economic Indicators Point to Continued Growth Despite Global Challenges",
      category: "Economy",
      time: "03:55 AM",
      image:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80",
    },
  ];

  // Latest news articles
  const latestNews = [
    {
      id: "10",
      title: "AI Integration Transforms Customer Service Industry",
      excerpt:
        "Companies report significant improvements in response times and customer satisfaction...",
      category: "Technology",
      categoryColor: "text-blue-500",
      time: "06:20 AM",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
    },
    {
      id: "11",
      title: "Renewable Energy Projects Set New Records in First Quarter",
      excerpt:
        "Solar and wind installations exceed projections as costs continue to decline...",
      category: "Environment",
      categoryColor: "text-green-500",
      time: "06:10 AM",
      image:
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80",
    },
    {
      id: "12",
      title:
        "Digital Currency Adoption Accelerates Among Major Financial Institutions",
      excerpt:
        "Banks announce new blockchain initiatives as regulatory framework develops...",
      category: "Finance",
      categoryColor: "text-yellow-500",
      time: "05:55 AM",
      image:
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80",
    },
    {
      id: "13",
      title:
        "Study Reveals Impact of Hybrid Learning Models on Student Outcomes",
      excerpt:
        "Research highlights benefits and challenges of combined in-person and remote...",
      category: "Education",
      categoryColor: "text-purple-500",
      time: "05:40 AM",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80",
    },
  ];

  // Category sections
  const categoryNews = {
    Technology: [
      {
        title:
          "Quantum Computing Breakthrough Promises New Era of Processing Power",
        subcategory: "Innovations",
        time: "05:20 AM",
      },
      {
        title:
          "Next-Generation Wearable Devices Focus on Health Monitoring Capabilities",
        subcategory: "Gadgets",
        time: "04:45 AM",
      },
      {
        title:
          "Open Source Projects Gaining Momentum in Enterprise Software Market",
        subcategory: "Software",
        time: "04:10 AM",
      },
    ],
    Business: [
      {
        title:
          "Global Stock Markets React to Central Bank Policy Announcements",
        subcategory: "Markets",
        time: "05:05 AM",
      },
      {
        title:
          "Tech Startup Secures Record Funding Round for Sustainable Energy Solution",
        subcategory: "Startups",
        time: "04:30 AM",
      },
      {
        title:
          "Economic Indicators Point to Continued Growth Despite Global Challenges",
        subcategory: "Economy",
        time: "03:55 AM",
      },
    ],
  };

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
