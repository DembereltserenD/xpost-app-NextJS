"use client";

import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import Script from "next/script";
import AdminLayout from "@/components/admin/AdminLayout";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AdminLayout>{children}</AdminLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
