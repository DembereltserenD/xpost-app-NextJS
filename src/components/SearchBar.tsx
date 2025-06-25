"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  onClose?: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-background">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          autoFocus
        />
      </div>
    </form>
  );
}
