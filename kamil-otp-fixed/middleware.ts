import { NextRequest, NextResponse } from 'next/server'

// Middleware ini hanya melindungi route admin login redirect.
// Auth check untuk dashboard dilakukan di client-side via AuthProvider (useAuth).
// Alasan: Firebase Auth state tidak tersedia di Edge middleware tanpa session cookie.

const ADMIN_PATHS = ['/admin']
const ADMIN_LOGIN = '/admin/login'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect /admin (tanpa /login) ke /admin/login
  const isAdminButNotLogin =
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !pathname.startsWith(ADMIN_LOGIN)

  if (isAdminButNotLogin) {
    const adminSession = req.cookies.get('admin-session')?.value
    if (!adminSession) {
      const url = req.nextUrl.clone()
      url.pathname = ADMIN_LOGIN
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
