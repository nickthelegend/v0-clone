import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user')?.value
  const path = request.nextUrl.pathname

  // Only protect dashboard and pricing routes
  const protectedPaths = ['/dashboard', '/pricing']
  const isProtectedPath = protectedPaths.includes(path)

  // Redirect to home if accessing protected route without auth
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/pricing', '/dashboard', '/login', '/signup'],
}
