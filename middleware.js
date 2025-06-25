import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if the route is an admin route
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Skip middleware for login page
    if (req.nextUrl.pathname === "/admin/login") {
      return res;
    }

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If no user, redirect to login
      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Check if user is admin
      const { data: authorData } = await supabase
        .from("authors")
        .select("role")
        .eq("email", user.email)
        .single();

      // If not admin, redirect to home
      if (!authorData || authorData.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
