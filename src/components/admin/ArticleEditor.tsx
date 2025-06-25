"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Upload, Save, X } from "lucide-react";
import { createSlug, markdownToHtml } from "@/lib/utils";
import {
  getCategories,
  getAuthors,
  uploadImage,
  createArticle,
  updateArticle,
} from "@/lib/supabase";

interface Article {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id: string;
  author_id: string;
  status: "draft" | "published";
  tags: string[];
  meta_title?: string;
  meta_description?: string;
}

interface ArticleEditorProps {
  article?: Article;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

export default function ArticleEditor({
  article,
  onSave,
  onCancel,
}: ArticleEditorProps) {
  const [formData, setFormData] = useState<Article>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category_id: "",
    author_id: "",
    status: "draft",
    tags: [],
    meta_title: "",
    meta_description: "",
    ...article,
  });

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.title && !article?.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: createSlug(formData.title),
      }));
    }
  }, [formData.title, article?.slug]);

  const loadData = async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        getCategories(),
        getAuthors(),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (authorsRes.data) setAuthors(authorsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleInputChange = (field: keyof Article, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.data?.publicUrl) {
        handleInputChange("featured_image", result.data.publicUrl);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title || !formData.content) {
      alert("Title and content are required");
      return;
    }

    setIsLoading(true);
    try {
      const articleData = {
        ...formData,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      let result;
      if (article?.id) {
        result = await updateArticle(article.id, articleData);
      } else {
        result = await createArticle(articleData);
      }

      if (result.error) {
        alert("Error saving article: " + result.error.message);
      } else {
        onSave?.(result.data);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {article?.id ? "Edit Article" : "Create New Article"}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {previewMode ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {formData.title || "Untitled Article"}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {formData.excerpt}
            </p>
            <div className="flex gap-2 mb-6">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(formData.content || "No content yet..."),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Article Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter article title"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-foreground">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="article-slug"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-foreground">
                    Excerpt
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleInputChange("excerpt", e.target.value)
                    }
                    placeholder="Brief description of the article"
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-foreground">
                    Content * (Markdown)
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    placeholder="Write your article content in Markdown..."
                    rows={20}
                    className="bg-background border-border text-foreground font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Featured Image
                </CardTitle>
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
                      onClick={() => handleInputChange("featured_image", "")}
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-foreground">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      handleInputChange("category_id", value)
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
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
                  <Label className="text-foreground">Author</Label>
                  <Select
                    value={formData.author_id}
                    onValueChange={(value) =>
                      handleInputChange("author_id", value)
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
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
                  <Label className="text-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published") =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    className="bg-background border-border text-foreground"
                  />
                  <Button onClick={addTag} size="sm">
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

            {/* SEO */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title" className="text-foreground">
                    Meta Title
                  </Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) =>
                      handleInputChange("meta_title", e.target.value)
                    }
                    placeholder="SEO title"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description" className="text-foreground">
                    Meta Description
                  </Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      handleInputChange("meta_description", e.target.value)
                    }
                    placeholder="SEO description"
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSave("draft")}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    onClick={() => handleSave("published")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Publishing..." : "Publish Article"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
