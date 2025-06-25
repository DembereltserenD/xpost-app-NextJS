"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { MessageCircle, Send, Reply } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { formatRelativeDate } from "@/lib/utils";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  avatarUrl?: string;
  replies?: Comment[];
  parentId?: string;
}

interface CommentSectionProps {
  articleId?: string;
  initialComments?: Comment[];
}

export default function CommentSection({
  articleId = "1",
  initialComments = [
    {
      id: "1",
      name: "John Doe",
      content:
        "This article was very informative. I learned a lot about the topic!",
      createdAt: "2023-05-15T10:30:00Z",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      replies: [
        {
          id: "1-1",
          name: "Alice Johnson",
          content:
            "I completely agree! The examples were particularly helpful.",
          createdAt: "2023-05-15T12:15:00Z",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          parentId: "1",
        },
      ],
    },
    {
      id: "2",
      name: "Sarah Smith",
      content:
        "I disagree with some points in this article. I think there are other perspectives to consider.",
      createdAt: "2023-05-16T14:20:00Z",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      replies: [],
    },
  ],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyFormData, setReplyFormData] = useState({
    name: "",
    email: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new comment
      const newComment: Comment = {
        id: Date.now().toString(),
        name: formData.name,
        content: formData.content,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        replies: [],
      };

      setMessage(
        "Comment submitted successfully! It will appear after moderation.",
      );
      setMessageType("success");
      setFormData({ name: "", email: "", content: "" });

      // In a real app, you would wait for moderation
      // For demo purposes, we'll add it immediately
      setComments((prev) => [newComment, ...prev]);
    } catch (error) {
      setMessage("Error submitting comment. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyFormData.name || !replyFormData.email || !replyFormData.content)
      return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new reply
      const newReply: Comment = {
        id: `${parentId}-${Date.now()}`,
        name: replyFormData.name,
        content: replyFormData.content,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${replyFormData.name}`,
        parentId,
      };

      // Add reply to the parent comment
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        }),
      );

      setMessage("Reply submitted successfully!");
      setMessageType("success");
      setReplyFormData({ name: "", email: "", content: "" });
      setReplyingTo(null);
    } catch (error) {
      setMessage("Error submitting reply. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReplyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setReplyFormData({
      ...replyFormData,
      [e.target.name]: e.target.value,
    });
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyFormData({ name: "", email: "", content: "" });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyFormData({ name: "", email: "", content: "" });
  };

  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return (
        total +
        1 +
        (comment.replies ? getTotalCommentCount(comment.replies) : 0)
      );
    }, 0);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-12 mt-4" : ""}`}>
      <Card className={`p-6 ${isReply ? "bg-muted/30" : ""}`}>
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={comment.avatarUrl} alt={comment.name} />
            <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold">{comment.name}</h5>
              <span className="text-sm text-muted-foreground">
                {formatRelativeDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-foreground leading-relaxed mb-3">
              {comment.content}
            </p>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startReply(comment.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <Card className="p-4 mt-4 ml-12 bg-muted/20">
          <h5 className="text-sm font-semibold mb-3">
            Reply to {comment.name}
          </h5>
          <form
            onSubmit={(e) => handleReplySubmit(e, comment.id)}
            className="space-y-3"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                type="text"
                name="name"
                value={replyFormData.name}
                onChange={handleReplyChange}
                placeholder="Your Name"
                required
                size="sm"
              />
              <Input
                type="email"
                name="email"
                value={replyFormData.email}
                onChange={handleReplyChange}
                placeholder="Your Email"
                required
                size="sm"
              />
            </div>
            <Textarea
              name="content"
              value={replyFormData.content}
              onChange={handleReplyChange}
              placeholder="Write your reply..."
              rows={3}
              required
              className="resize-y"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="w-3 h-3" />
                {isSubmitting ? "Submitting..." : "Submit Reply"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelReply}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <section className="border-t border-border pt-8 bg-background">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-semibold">
          Comments ({getTotalCommentCount(comments)})
        </h3>
      </div>

      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <h4 className="text-lg font-semibold mb-4">Leave a Comment</h4>

        {message && (
          <Alert
            className={`mb-4 ${messageType === "error" ? "border-destructive/50 text-destructive" : "border-green-600/50 text-green-600 bg-green-600/10"}`}
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>

          <Textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your comment..."
            rows={4}
            required
            className="resize-y"
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
