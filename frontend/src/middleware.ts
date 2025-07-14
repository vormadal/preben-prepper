import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  // If not logged in and trying to access a protected route, redirect to signin
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  // If logged in and trying to access auth pages, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
