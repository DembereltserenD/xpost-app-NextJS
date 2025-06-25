"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getArticleById } from "@/lib/supabase";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      const { data, error } = await getArticleById(params.id);
      if (error) {
        setError(error.message);
      } else {
        setArticle(data);
      }
    } catch (err) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedArticle: any) => {
    router.push("/admin/articles");
  };

  const handleCancel = () => {
    router.push("/admin/articles");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin/articles")}
            className="text-primary hover:underline"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ArticleEditor
        article={article}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
