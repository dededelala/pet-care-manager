import { NextResponse } from 'next/server'

export default async function middleware(req: Request) {
  // Simple auth check - redirect to login if not logged in
  const isLoggedIn = false // TODO: Implement proper auth check

  const { nextUrl } = req as any

  // 未登录用户访问受保护页面时重定向到登录页
  if (!isLoggedIn && !nextUrl.pathname.startsWith('/auth') && !nextUrl.pathname.startsWith('/api/auth')) {
    const signInUrl = new URL('/auth/login', nextUrl)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - auth (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
