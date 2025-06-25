"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createArticle,
  updateArticle,
  getCategories,
  getAuthors,
  uploadImage,
} from "@/lib/supabase";
import { createSlug } from "@/lib/utils";
import { Save, Eye, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MarkdownEditor from "../MarkdownEditor";

interface Article {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id: string;
  author_id: string;
  tags: string[];
  status: "draft" | "published";
  meta_title?: string;
  meta_description?: string;
}

interface ArticleFormProps {
  article?: Article;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

export default function ArticleForm({
  article,
  onSave,
  onCancel,
}: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!article;

  const [formData, setFormData] = useState<Article>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category_id: "",
    author_id: "",
    tags: [],
    status: "draft",
    meta_title: "",
    meta_description: "",
    ...article,
  });

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.title && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        slug: createSlug(formData.title),
      }));
    }
  }, [formData.title, isEditing]);

  const loadInitialData = async () => {
    try {
      const [categoriesResult, authorsResult] = await Promise.all([
        getCategories(),
        getAuthors(),
      ]);

      setCategories(categoriesResult.data || []);
      setAuthors(authorsResult.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const handleChange = (field: keyof Article, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.data?.publicUrl) {
        handleChange("featured_image", result.data.publicUrl);
      } else {
        setMessage("Error uploading image");
      }
    } catch (error) {
      setMessage("Error uploading image");
    } finally {
      setImageUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setLoading(true);
    setMessage("");

    try {
      let result;
      if (isEditing && article?.id) {
        result = await updateArticle(article.id, formData);
      } else {
        result = await createArticle(formData);
      }

      if (result.error) throw result.error;

      setMessage(
        isEditing
          ? "Article updated successfully!"
          : "Article created successfully!",
      );

      if (onSave) {
        onSave(result.data);
      } else {
        setTimeout(() => {
          router.push("/admin/articles");
        }, 1000);
      }
    } catch (error: any) {
      setMessage("Error saving article: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (article && article.slug) {
      window.open(`/article/${article.slug}`, "_blank");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("Error")
              ? "bg-destructive/20 text-destructive border border-destructive/30"
              : "bg-green-600/20 text-green-600 border border-green-600/30"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="article-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  placeholder="Brief description of the article"
                  rows={3}
                />
              </div>

              <div>
                <Label>Content *</Label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(value) => handleChange("content", value)}
                  placeholder="Write your article content in Markdown..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.featured_image ? (
                <div className="space-y-4">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange("featured_image", "")}
                    className="w-full"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {imageUploading
                        ? "Uploading..."
                        : "Click to upload image"}
                    </span>
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleChange("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Author</Label>
                <Select
                  value={formData.author_id}
                  onValueChange={(value) => handleChange("author_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author: any) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "published") =>
                    handleChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading
                    ? "Saving..."
                    : isEditing
                      ? "Update Article"
                      : "Create Article"}
                </Button>
                {isEditing && article?.status === "published" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
