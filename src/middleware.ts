import createMiddleware from 'next-intl/middleware';
// Middleware for i18n and basic auth check
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const i18nMiddleware = createMiddleware(routing);

// Define public routes that don't require authentication
const publicRoutes = ['/init', '/login', '/register'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from pathname
  const pathnameWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Skip checks for API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return i18nMiddleware(request);
  }

  // Check authentication for protected routes
  // We only check for the presence of the session cookie here
  // Detailed validation happens in Server Actions/Components
  if (!isPublicRoute) {
    const session = request.cookies.get('omnikit_session');
    if (!session) {
      const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return i18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|icon.svg|sw.js|site.webmanifest|sitemap.xml|robots.txt|ads.txt).*)']
};
