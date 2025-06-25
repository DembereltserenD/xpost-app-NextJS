"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  getAdminArticles,
  deleteArticle,
  getCategories,
  getAuthors,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpDown,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { formatDate, formatRelativeDate } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  featured_image: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  views: number;
  category_id: string;
  author_id: string;
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

type SortField = "title" | "status" | "published_at" | "views" | "created_at";
type SortOrder = "asc" | "desc";

export default function AdminArticlesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(10);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
        }
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
        if (authorsResult.data) {
          setAuthors(authorsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [isUserAdmin]);

  useEffect(() => {
    let filtered = [...articles];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((article) => article.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (article) => article.category_id === categoryFilter,
      );
    }

    // Apply author filter
    if (authorFilter !== "all") {
      filtered = filtered.filter(
        (article) => article.author_id === authorFilter,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "published_at" || sortField === "created_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredArticles(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    articles,
    searchTerm,
    statusFilter,
    categoryFilter,
    authorFilter,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    setDeleteLoading(id);
    try {
      const { error } = await deleteArticle(id);
      if (error) {
        console.error("Failed to delete article:", error);
        alert("Failed to delete article. Please try again.");
      } else {
        setArticles(articles.filter((article) => article.id !== id));
        alert(`Article "${title}" has been deleted successfully.`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the article.");
    } finally {
      setDeleteLoading(null);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
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
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-card"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Articles Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your articles, drafts, and published content
              </p>
            </div>
          </div>
          <Link href="/admin/articles/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {articles.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {articles.filter((a) => a.status === "published").length}
              </div>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {articles.filter((a) => a.status === "draft").length}
              </div>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-popover-foreground">
                    All Statuses
                  </SelectItem>
                  <SelectItem
                    value="published"
                    className="text-popover-foreground"
                  >
                    Published
                  </SelectItem>
                  <SelectItem value="draft" className="text-popover-foreground">
                    Draft
                  </SelectItem>
                  <SelectItem
                    value="archived"
                    className="text-popover-foreground"
                  >
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-popover-foreground">
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-popover-foreground"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="text-popover-foreground">
                    All Authors
                  </SelectItem>
                  {authors.map((author) => (
                    <SelectItem
                      key={author.id}
                      value={author.id}
                      className="text-popover-foreground"
                    >
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setAuthorFilter("all");
                }}
                className="border-border text-foreground hover:bg-background"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead
                    className="text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-foreground">Category</TableHead>
                  <TableHead className="text-foreground">Author</TableHead>
                  <TableHead
                    className="text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center gap-2">
                      Views
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleSort("published_at")}
                  >
                    <div className="flex items-center gap-2">
                      Published
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentArticles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No articles found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentArticles.map((article) => (
                    <TableRow key={article.id} className="border-border">
                      <TableCell className="text-foreground">
                        <div>
                          <div className="font-medium">{article.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(article.status)}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.categories?.name || "Uncategorized"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.authors?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.views || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.published_at
                          ? formatRelativeDate(article.published_at)
                          : "Not published"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/article/${article.slug}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-foreground hover:bg-background"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-foreground hover:bg-background"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/20"
                                disabled={deleteLoading === article.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-popover border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-popover-foreground">
                                  Delete Article
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Are you sure you want to delete &quot;
                                  {article.title}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border text-foreground hover:bg-background">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(article.id, article.title)
                                  }
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={`text-foreground hover:bg-card ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </PaginationItem>
                {generatePageNumbers().map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                      className="text-foreground hover:bg-card"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={`text-foreground hover:bg-card ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 text-center text-muted-foreground text-sm">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredArticles.length)} of{" "}
          {filteredArticles.length} articles
          {filteredArticles.length !== articles.length &&
            ` (filtered from ${articles.length} total)`}
        </div>
      </div>
    </div>
  );
}
