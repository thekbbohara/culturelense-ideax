import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getUserLocale = cache(async (): Promise<string> => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('[i18n] No authenticated user, defaulting to English');
            return 'en'; // Default for non-authenticated users
        }

        // Query user preferences - note: database column is user_id (snake_case)
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('language')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('[i18n] Error fetching preferences:', error);
            return 'en';
        }

        const locale = preferences?.language || 'en';
        console.log('[i18n] User locale:', locale);
        return locale;
    } catch (error) {
        console.error('[i18n] Exception in getUserLocale:', error);
        return 'en';
    }
});
