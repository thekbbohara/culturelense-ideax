'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setAuth, clearAuth } from '@/store/slices/authSlice';
import { getVendorByUserId } from '@/actions/marketplace';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const supabase = createClient();

  useEffect(() => {
    const syncAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email || null;

        // Fetch vendorId if exists
        const vendorRes = await getVendorByUserId(userId);
        const vendorId = vendorRes.success ? (vendorRes.data as any).id : null;

        dispatch(setAuth({ userId, email, vendorId }));
      } else {
        dispatch(clearAuth());
      }
    };

    syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email || null;

        // Re-fetch vendorId on session change
        getVendorByUserId(userId).then((vendorRes) => {
          const vendorId = vendorRes.success ? (vendorRes.data as any).id : null;
          dispatch(setAuth({ userId, email, vendorId }));
        });
      } else {
        dispatch(clearAuth());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase]);

  return null;
}
