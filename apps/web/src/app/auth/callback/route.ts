import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, users } from '@culturelense/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.session?.user) {
      const { user } = data.session;
      
      try {
        await db.insert(users).values({
          id: user.id,
          email: user.email!,
          role: 'user',
        }).onConflictDoNothing();
      } catch (err) {
        console.error('Error syncing user to DB:', err);
        // Continue login flow even if sync fails? Or redirect to error?
        // Typically better to let them in but log error, or ensure simple sync works.
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

