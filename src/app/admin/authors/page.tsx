"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAuthors } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Users, Mail } from "lucide-react";

type Author = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  role: string;
  created_at: string;
};

export default function AuthorsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
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
    const fetchAuthors = async () => {
      if (!isUserAdmin) return;

      try {
        const { data } = await getAuthors();
        if (data) {
          setAuthors(data);
        }
      } catch (error) {
        console.error("Failed to fetch authors:", error);
      }
    };

    fetchAuthors();
  }, [isUserAdmin]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "author":
        return "outline";
      default:
        return "outline";
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Authors Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage writers and contributors
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Author
          </Button>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <Card key={author.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={author.avatar_url} alt={author.name} />
                    <AvatarFallback>
                      {author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-foreground">
                      {author.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {author.email}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(author.role)}>
                    {author.role}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  {author.bio || "No bio provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Joined: {new Date(author.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {authors.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No authors found
              </h3>
              <p className="text-muted-foreground mb-4">
                Add authors to start creating content
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Author
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
