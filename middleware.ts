import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export default async function middleware(req: Request) {
  const { nextUrl } = req as any

  // 未登录用户访问受保护页面时重定向到登录页
  const isPublicPath = nextUrl.pathname.startsWith('/auth') ||
                       nextUrl.pathname.startsWith('/api/auth') ||
                       nextUrl.pathname.startsWith('/_next') ||
                       nextUrl.pathname.startsWith('/favicon.ico')

  if (!isPublicPath) {
    const token = getTokenFromRequest(req)

    if (!token) {
      const signInUrl = new URL('/auth/login', nextUrl)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    try {
      // 验证JWT token
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key')
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      // Token无效，重定向到登录页
      const signInUrl = new URL('/auth/login', nextUrl)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

function getTokenFromRequest(req: Request): string | null {
  // 从Cookie中获取token
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
    const [name, value] = cookie.trim().split('=')
    acc[name] = value
    return acc
  }, {})

  // NextAuth 5 使用不同的cookie名称
  return cookies['next-auth.session-token'] ||
         cookies['__Secure-next-auth.session-token'] ||
         null
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
