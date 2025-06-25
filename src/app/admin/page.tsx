"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Users, FileText, MessageSquare, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/admin/login");
          return;
        }

        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.push("/");
          return;
        }

        setUser(currentUser);
        setIsUserAdmin(adminStatus);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !isUserAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-dark-text mt-2">Welcome back, {user.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-dark-border text-white hover:bg-dark-card"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Articles
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-dark-text">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Views
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4,187</div>
              <p className="text-xs text-dark-text">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Comments
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">132</div>
              <p className="text-xs text-dark-text">+8 pending approval</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Categories
              </CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">6</div>
              <p className="text-xs text-dark-text">Active categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Article Management</CardTitle>
              <CardDescription className="text-dark-text">
                Create, edit, and manage your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Create New Article
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-dark-border text-white hover:bg-dark-bg"
                >
                  Manage Articles
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Comment Moderation</CardTitle>
              <CardDescription className="text-dark-text">
                Review and moderate user comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Review Comments
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-dark-border text-white hover:bg-dark-bg"
                >
                  Comment Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Site Settings</CardTitle>
              <CardDescription className="text-dark-text">
                Configure site settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Site Configuration
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-dark-border text-white hover:bg-dark-bg"
                >
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
