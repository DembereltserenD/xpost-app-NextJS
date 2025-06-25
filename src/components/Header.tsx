"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, User, LogOut } from "lucide-react";
import SearchBar from "./SearchBar";
import { getCurrentUser, signOut, isAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const adminStatus = await isAdmin();
          setUserIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserIsAdmin(false);
      window.location.reload();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="fixed top-10 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            xpost.mn
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/category/politics"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Politics
            </Link>
            <Link
              href="/category/business"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Business
            </Link>
            <Link
              href="/category/tech"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Tech
            </Link>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-popover border-border"
                  align="end"
                >
                  <DropdownMenuItem className="text-popover-foreground focus:bg-accent focus:text-accent-foreground">
                    <User className="w-4 h-4 mr-2" />
                    {user.email}
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        asChild
                        className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <Link href="/admin">
                          <User className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Link href="/admin/login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-4 pt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/category/politics"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Politics
              </Link>
              <Link
                href="/category/business"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Business
              </Link>
              <Link
                href="/category/tech"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tech
              </Link>
              <div className="pt-2">
                <SearchBar onClose={() => setIsMenuOpen(false)} />
              </div>

              {/* Mobile Theme Switcher */}
              <div className="pt-2">
                <ThemeSwitcher />
              </div>

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-sm px-2">
                      Signed in as: {user.email}
                    </div>
                    {userIsAdmin && (
                      <Link
                        href="/admin"
                        className="block text-muted-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block text-muted-foreground hover:text-primary transition-colors py-2 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/admin/login"
                    className="block text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
