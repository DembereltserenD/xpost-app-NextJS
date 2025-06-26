"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAdminArticles } from "@/lib/supabase";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Check, X, Eye, Trash2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

type Comment = {
  id: string;
  name: string;
  email: string;
  content: string;
  status: string;
  created_at: string;
  article_title?: string;
};

export default function CommentsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState("all");
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
    const fetchComments = async () => {
      if (!isUserAdmin) return;

      try {
        // Mock comments data since we don't have a direct getComments function
        const mockComments: Comment[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            content: "Great article! Very informative and well-written.",
            status: "pending",
            created_at: new Date().toISOString(),
            article_title: "Welcome to xpost.mn",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            content: "I disagree with some points, but overall a good read.",
            status: "approved",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            article_title: "Digital Transformation in Mongolia",
          },
          {
            id: "3",
            name: "Anonymous",
            email: "spam@spam.com",
            content: "This is spam content with promotional links.",
            status: "rejected",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            article_title: "Welcome to xpost.mn",
          },
        ];
        setComments(mockComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, [isUserAdmin]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "spam":
        return "outline";
      default:
        return "secondary";
    }
  };

  const filteredComments = comments.filter(
    (comment) => filter === "all" || comment.status === filter,
  );

  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
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
              Comments Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Moderate and manage user comments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
              <p className="text-sm text-muted-foreground">Total Comments</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">
                {stats.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {stats.approved}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">
                {stats.rejected}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Comments Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Author</TableHead>
                  <TableHead className="text-foreground">Comment</TableHead>
                  <TableHead className="text-foreground">Article</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No comments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id} className="border-border">
                      <TableCell className="text-foreground">
                        <div>
                          <div className="font-medium">{comment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {comment.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground max-w-xs">
                        <p className="truncate">{comment.content}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {comment.article_title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(comment.status)}>
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeDate(comment.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {comment.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
