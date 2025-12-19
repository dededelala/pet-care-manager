import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default async function middleware(req: Request) {
  const { nextUrl } = req as any

  // 未登录用户访问受保护页面时重定向到登录页
  const isPublicPath = nextUrl.pathname.startsWith('/auth') ||
                       nextUrl.pathname.startsWith('/api/auth') ||
                       nextUrl.pathname.startsWith('/_next') ||
                       nextUrl.pathname.startsWith('/favicon.ico')

  if (!isPublicPath) {
    // 使用 NextAuth 5 内置的 auth() 函数
    const session = await auth()

    if (!session) {
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
