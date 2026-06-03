import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/buy', '/orders', '/topup', '/profile']
const ADMIN_PATHS = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('firebase-session')?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected || isAdmin) {
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = isAdmin ? '/admin/login' : '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/buy/:path*',
    '/orders/:path*',
    '/topup/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
