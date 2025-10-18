import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user')?.value
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.includes(path)

  // Redirect to login if accessing protected route without auth
  if (!isPublicPath && !user && path !== '/login' && path !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to home if accessing auth pages while logged in
  if (isPublicPath && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/pricing', '/dashboard', '/login', '/signup'],
}
