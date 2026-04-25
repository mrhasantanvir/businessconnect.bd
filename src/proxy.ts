import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth-edge";

// 1. Specify protected and public routes
const protectedRoutes = ["/admin", "/hr", "/products", "/support", "/mobile", "/merchant", "/dashboard", "/orders"];
const publicRoutes = ["/", "/landing", "/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to dashboard if the user is authenticated and tries to access /login
  if (isPublicRoute && session && path === "/login") {
    if (session.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    } else if (session.role === "STAFF") {
      return NextResponse.redirect(new URL("/mobile/staff", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 6. Role-based access control
  if (session) {
    // Super Admins should not access merchant routes
    if ((path.startsWith("/merchant") || path.startsWith("/dashboard")) && session.role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
    // Non-admins should not access admin routes
    if (path.startsWith("/admin") && session.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  // 7. Multi-tenant Rewrite Logic
  const hostname = req.headers.get("host") || "";
  const platformDomain = "localhost:3030"; 
  
  if (hostname !== platformDomain && !path.startsWith("/api") && !path.startsWith("/_next")) {
    const isSubdomain = hostname.endsWith(`.${platformDomain}`);
    if (isSubdomain) {
      const slug = hostname.replace(`.${platformDomain}`, "");
      return NextResponse.rewrite(new URL(`/s/${slug}${path}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
