"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAdminArticles } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Users,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  views: number;
  published_at: string;
  status: string;
  authors: { name: string };
  categories: { name: string };
};

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    avgViews: 0,
    topArticles: [] as Article[],
    recentActivity: [] as Article[],
    viewsThisMonth: 0,
    viewsLastMonth: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/admin/login");
          return;
        }

        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.push("/");
          return;
        }

        setUser(currentUser);
        setIsUserAdmin(adminStatus);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isUserAdmin) return;

      try {
        const { data } = await getAdminArticles();
        if (data) {
          setArticles(data);

          const totalViews = data.reduce(
            (sum: number, article: Article) => sum + (article.views || 0),
            0,
          );

          const publishedArticles = data.filter(
            (a: Article) => a.status === "published",
          );
          const avgViews =
            publishedArticles.length > 0
              ? Math.round(totalViews / publishedArticles.length)
              : 0;

          const topArticles = [...data]
            .sort((a: Article, b: Article) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

          const recentActivity = [...data]
            .sort(
              (a: Article, b: Article) =>
                new Date(b.published_at || b.created_at).getTime() -
                new Date(a.published_at || a.created_at).getTime(),
            )
            .slice(0, 5);

          // Mock monthly data
          const viewsThisMonth = Math.round(totalViews * 0.3);
          const viewsLastMonth = Math.round(totalViews * 0.25);

          setAnalytics({
            totalViews,
            avgViews,
            topArticles,
            recentActivity,
            viewsThisMonth,
            viewsLastMonth,
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };

    fetchAnalytics();
  }, [isUserAdmin]);

  const growthRate =
    analytics.viewsLastMonth > 0
      ? Math.round(
          ((analytics.viewsThisMonth - analytics.viewsLastMonth) /
            analytics.viewsLastMonth) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isUserAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your content performance and engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all articles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Average Views
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.avgViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Per published article
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics.viewsThisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {growthRate > 0 ? "+" : ""}
                {growthRate}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Growth Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  growthRate > 0
                    ? "text-green-500"
                    : growthRate < 0
                      ? "text-red-500"
                      : "text-foreground"
                }`}
              >
                {growthRate > 0 ? "+" : ""}
                {growthRate}%
              </div>
              <p className="text-xs text-muted-foreground">Month over month</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Top Performing Articles
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Articles with the most views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">
                          {article.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {article.authors?.name} • {article.categories?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {(article.views || 0).toLocaleString()} views
                      </Badge>
                    </div>
                  </div>
                ))}
                {analytics.topArticles.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No articles found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest published articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {article.authors?.name} •{" "}
                        {formatRelativeDate(article.published_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          article.status === "published"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {article.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {analytics.recentActivity.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Performance Summary
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Overview of your content performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {articles.filter((a) => a.status === "published").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Published Articles
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {analytics.avgViews}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average Views per Article
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {Math.round(analytics.totalViews / 30)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Daily Average Views
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
