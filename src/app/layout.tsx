"use client";

import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminLogin = pathname === "/admin/login";

  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TempoInit />
          {!isAdminLogin && (
            <>
              <BreakingNewsTicker />
              <Header />
            </>
          )}
          <main
            className={
              isAdminLogin
                ? ""
                : "min-h-screen pt-28 bg-background text-foreground"
            }
          >
            {children}
          </main>
          {!isAdminLogin && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}
