"use client";

import { useState } from "react";
import { Share2, Link, Check } from "lucide-react";
import { shareArticle } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const success = await shareArticle(title, url);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="bg-card border-border text-card-foreground hover:border-primary/50 hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}
