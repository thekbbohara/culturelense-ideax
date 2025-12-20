import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    // Treat as unauthenticated if session is corrupted
    console.error('Middleware auth error:', error);
  }
  const path = request.nextUrl.pathname;

  // White-listed public routes
  // Allows landing page, auth callbacks, login page (if exists), and any Next.js internals handled by matcher
  // White-listed public routes
  // Allows landing page, auth callbacks, login page (if exists), and any Next.js internals handled by matcher
  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/auth') || 
    path.startsWith('/login') ||
    path === '/sw.js' ||
    path.startsWith('/workbox-') ||
    path === '/manifest.json';

  // 1. Unauthenticated Users
  if (!user) {
    if (!isPublicRoute) {
      // Redirect any non-public route to landing page
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access to public routes
    return response;
  }

  // 2. Authenticated Users

  // Redirect from Landing Page to Home
  if (path === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Role-Based Access Control for /vendor and /admin
  if (path.startsWith('/vendor') || path.startsWith('/admin')) {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !dbUser) {
      // If user not found in DB or error, treat as unauthorized for protected scopes -> home
      return NextResponse.redirect(new URL('/home', request.url));
    }

    const role = dbUser.role;

    // Vendor Protection
    if (path.startsWith('/vendor') && role !== 'vendor') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // Admin Protection
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
