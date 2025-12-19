'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { vendors } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function submitVendorApplication(prevState: any, formData: FormData) {
    // Gracefully handle missing Supabase client
    try {
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'You must be logged in to apply.' };
        }

        const businessName = formData.get('businessName') as string;
        const description = formData.get('description') as string;

        if (!businessName || businessName.length < 3) {
            return { error: 'Business name must be at least 3 characters.' };
        }

        // Check for duplicate business name
        const existingVendor = await db.query.vendors.findFirst({
            where: (vendors, { eq }) => eq(vendors.businessName, businessName),
        });

        if (existingVendor) {
            return { error: 'A business with this name already exists. Please choose another.' };
        }

        try {
            // Check if user already has a vendor profile (to update instead of fail if re-applying is allowed, or just handle unique constraint)
            // For now, we assume unique constraint on userId handles one-vendor-per-user.
            // But we want to gracefully catch it.

            await db.insert(vendors).values({
                userId: user.id,
                businessName,
                description,
                verificationStatus: 'pending',
            });

            revalidatePath('/profile');
            return { success: true, message: 'Application submitted! Status: Pending Verification.' };
        } catch (error: any) {
            console.error('Vendor application error:', error);
            if (error.code === '23505') { // Unique violation
                // Check if it's the user ID usage
                return { error: 'You have already applied. Please check your status.' };
            }
            return { error: 'Failed to submit application. Please try again.' };
        }

    } catch (error) {
        console.error("Supabase/DB Error:", error);
        return { error: 'System configuration error. Please contact support.' };
    }
}
