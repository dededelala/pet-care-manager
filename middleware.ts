import { NextResponse } from 'next/server'

export default async function middleware(req: Request) {
  const { nextUrl } = req as any

  // 未登录用户访问受保护页面时重定向到登录页
  const isPublicPath = nextUrl.pathname.startsWith('/auth') ||
                       nextUrl.pathname.startsWith('/api/auth') ||
                       nextUrl.pathname.startsWith('/_next') ||
                       nextUrl.pathname.startsWith('/favicon.ico')

  if (!isPublicPath) {
    // 简化版本：不导入 auth 库，检查 cookies
    const cookieHeader = req.headers.get('cookie')

    if (!cookieHeader) {
      const signInUrl = new URL('/auth/login', nextUrl)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // 检查是否有 NextAuth session cookie
    const hasSession = cookieHeader.includes('next-auth.session-token') ||
                      cookieHeader.includes('__Secure-next-auth.session-token')

    if (!hasSession) {
      const signInUrl = new URL('/auth/login', nextUrl)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
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
