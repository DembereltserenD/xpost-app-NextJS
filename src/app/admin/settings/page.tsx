"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Database,
  Palette,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "xpost.mn",
    siteDescription: "Mongolia's premier news platform",
    siteUrl: "https://xpost.mn",
    contactEmail: "contact@xpost.mn",
    adminEmail: "admin@xpost.mn",
    commentsEnabled: true,
    registrationEnabled: false,
    maintenanceMode: false,
    analyticsEnabled: true,
    emailNotifications: true,
    darkMode: true,
  });
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isUserAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your site settings and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Site Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Basic information about your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName" className="text-foreground">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) =>
                      handleInputChange("siteName", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription" className="text-foreground">
                    Site Description
                  </Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) =>
                      handleInputChange("siteDescription", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl" className="text-foreground">
                    Site URL
                  </Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) =>
                      handleInputChange("siteUrl", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Site Features
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enable or disable site features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to comment on articles
                    </p>
                  </div>
                  <Switch
                    checked={settings.commentsEnabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("commentsEnabled", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("registrationEnabled", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable site analytics tracking
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("analyticsEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure email addresses and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactEmail" className="text-foreground">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail" className="text-foreground">
                    Admin Email
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      handleInputChange("adminEmail", e.target.value)
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for new comments and
                      activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("emailNotifications", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the site in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleInputChange("maintenanceMode", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Change Admin Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Manage API Keys
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Security Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Advanced configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Export Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    Import Content
                  </Button>
                  <Button variant="outline" className="w-full">
                    Clear Cache
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Reset All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize the appearance of your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark theme by default
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) =>
                      handleInputChange("darkMode", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
