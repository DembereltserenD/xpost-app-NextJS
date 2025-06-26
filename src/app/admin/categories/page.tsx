"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tags } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  created_at: string;
};

export default function CategoriesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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
    const fetchCategories = async () => {
      if (!isUserAdmin) return;

      try {
        const { data } = await getCategories();
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [isUserAdmin]);

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
              Categories Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your content with categories
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-foreground">
                      {category.name}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    <Tags className="w-3 h-3 mr-1" />
                    {category.slug}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  {category.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Created:{" "}
                    {new Date(category.created_at).toLocaleDateString()}
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

        {categories.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Tags className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No categories found
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first category to organize your content
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
