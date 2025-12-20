import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, users } from '@/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    // console.log('Auth callback: processing code');
    const supabase = createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback: error exchanging code for session:', error);
    }

    if (!error && data?.session?.user) {
      const { user } = data.session;
      // console.log('Auth callback: session established for user', user.id);

      try {
        await db
          .insert(users)
          .values({
            id: user.id,
            email: user.email!,
            role: 'user',
          })
          .onConflictDoNothing();
        // console.log('Auth callback: user synced to DB');
      } catch (err) {
        console.error('Auth callback: Error syncing user to DB:', err);
      }

      // console.log('Auth callback: redirecting to', `${origin}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // console.log('Auth callback: no code or auth error, redirecting to error page');

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
