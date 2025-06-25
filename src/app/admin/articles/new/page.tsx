"use client";

import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function NewArticlePage() {
  const router = useRouter();

  const handleSave = (article: any) => {
    // Redirect to the article list or the created article
    router.push("/admin/articles");
  };

  const handleCancel = () => {
    router.push("/admin/articles");
  };

  return (
    <div className="min-h-screen bg-background">
      <ArticleEditor onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
