"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, signOut } from "@/lib/auth";
import {
  getAdminArticles,
  getCategories,
  getAuthors,
  getComments,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Eye,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  views: number;
  published_at: string;
  created_at: string;
  authors: { name: string };
  categories: { name: string };
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Author = {
  id: string;
  name: string;
};

type Comment = {
  id: string;
  name: string;
  content: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    totalCategories: 0,
    totalAuthors: 0,
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
    const fetchData = async () => {
      if (!isUserAdmin) return;

      try {
        const [articlesResult, categoriesResult, authorsResult] =
          await Promise.all([
            getAdminArticles(),
            getCategories(),
            getAuthors(),
          ]);

        if (articlesResult.data) {
          setArticles(articlesResult.data);
          const totalViews = articlesResult.data.reduce(
            (sum: number, article: Article) => sum + (article.views || 0),
            0,
          );
          const publishedCount = articlesResult.data.filter(
            (article: Article) => article.status === "published",
          ).length;
          const draftCount = articlesResult.data.filter(
            (article: Article) => article.status === "draft",
          ).length;

          setStats((prev) => ({
            ...prev,
            totalArticles: articlesResult.data.length,
            publishedArticles: publishedCount,
            draftArticles: draftCount,
            totalViews: totalViews,
          }));
        }

        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
          setStats((prev) => ({
            ...prev,
            totalCategories: categoriesResult.data.length,
          }));
        }

        if (authorsResult.data) {
          setAuthors(authorsResult.data);
          setStats((prev) => ({
            ...prev,
            totalAuthors: authorsResult.data.length,
          }));
        }

        // Fetch comments for all articles
        if (articlesResult.data && articlesResult.data.length > 0) {
          const allComments = [];
          for (const article of articlesResult.data) {
            const commentsResult = await getComments(article.id);
            if (commentsResult.data) {
              allComments.push(...commentsResult.data);
            }
          }
          setComments(allComments);
          const pendingCount = allComments.filter(
            (comment: Comment) => comment.status === "pending",
          ).length;
          setStats((prev) => ({
            ...prev,
            totalComments: allComments.length,
            pendingComments: pendingCount,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [isUserAdmin]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-card"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-border text-foreground hover:bg-card"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Articles
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalArticles}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedArticles} published, {stats.draftArticles}{" "}
                drafts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Views
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all articles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Comments
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalComments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingComments} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Categories
              </CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAuthors} authors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Recent Articles</CardTitle>
              <Link href="/admin/articles">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-background"
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.slice(0, 5).map((article) => (
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
                        {formatRelativeDate(article.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getStatusBadgeVariant(article.status)}>
                        {article.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {article.views || 0} views
                      </span>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No articles found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Categories</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-background"
              >
                Manage
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{category.slug}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {
                        articles.filter(
                          (a) => a.categories?.name === category.name,
                        ).length
                      }{" "}
                      articles
                    </span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No categories found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Article Management
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create, edit, and manage your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/admin/articles/new">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Article
                  </Button>
                </Link>
                <Link href="/admin/articles">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-background"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Articles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Comment Moderation
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Review and moderate user comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review Comments ({stats.pendingComments})
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-background"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Comment Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Site Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure categories and authors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Categories
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-background"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Authors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
