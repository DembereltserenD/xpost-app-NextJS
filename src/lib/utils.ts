import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

export const generateSlug = createSlug;

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeDate = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDate(date);
};

export const markdownToHtml = (markdown: string) => {
  // Simple markdown to HTML conversion
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/gim, "<br>");
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export const extractTags = (content: string) => {
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = content.match(tagRegex);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
};

export const shareArticle = async (title: string, url: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
      return true;
    } catch (err) {
      console.log("Error sharing:", err);
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.log("Could not copy to clipboard:", err);
    return false;
  }
};
