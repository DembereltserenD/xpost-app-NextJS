"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { markdownToHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "Write your content in Markdown...",
  rows = 15,
  className = "",
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const handleTogglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {isPreview ? "Preview" : "Markdown"}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTogglePreview}
          className="flex items-center gap-2"
        >
          {isPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isPreview ? (
          <div
            className="prose prose-invert max-w-none min-h-[300px] text-foreground"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(value || "*No content to preview*"),
            }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
          />
        )}
      </div>

      {/* Help text */}
      {!isPreview && (
        <div className="px-4 pb-3 text-xs text-muted-foreground">
          Supports Markdown syntax: **bold**, *italic*, # headers, [links](url),
          etc.
        </div>
      )}
    </div>
  );
}
