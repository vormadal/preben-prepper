import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  
  // Onboarding route
  const isOnboardingRoute = nextUrl.pathname === '/onboarding'

  // If not logged in and trying to access a protected route, redirect to signin
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  // If logged in and trying to access auth pages, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // If logged in and not on onboarding page, check if user has a home
  if (isLoggedIn && !isOnboardingRoute && !isPublicRoute) {
    try {
      const userId = req.auth?.user?.id
      if (userId) {
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/homes?userId=${userId}`)
        if (response.ok) {
          const homes = await response.json()
          if (homes.length === 0) {
            // No homes found, redirect to onboarding
            return NextResponse.redirect(new URL('/onboarding', nextUrl))
          }
        }
      }
    } catch (error) {
      console.error("Error checking user homes in middleware:", error)
      // Continue to the requested page if there's an error checking homes
    }
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
