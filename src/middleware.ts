import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    try {
      // Create Supabase client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // Handle cookie setting
            },
            remove(name: string, options: any) {
              // Handle cookie removal
            },
          },
        }
      );

      // Check if user is authenticated
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Redirect to login page
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('blog_user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleError || !roleData) {
        // Redirect to login page if no role found
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // User is authenticated and has a role, allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // For non-admin routes, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};