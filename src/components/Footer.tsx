"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
            >
              xpost.mn
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md">
              Breaking news and analysis from Mongolia. Stay informed with the
              latest developments in politics, business, technology, and more.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@xpost.mn"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/politics"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Politics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/business"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href="/category/tech"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/category/sports"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} xpost.mn. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Made with ❤️ in Mongolia
          </p>
        </div>
      </div>
    </footer>
  );
}
