"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  Plus,
  LogOut,
  Menu,
  X,
  Users,
  MessageSquare,
  Settings,
  Tags,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Articles", href: "/admin/articles", icon: FileText },
    { name: "New Article", href: "/admin/articles/new", icon: Plus },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Authors", href: "/admin/authors", icon: Users },
    { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/" className="text-xl font-bold text-foreground">
            xpost.mn Admin
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/articles" &&
                  pathname.startsWith("/admin/articles"));

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          {user && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Signed in as:</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full justify-start px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-foreground font-medium">Admin Panel</div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
