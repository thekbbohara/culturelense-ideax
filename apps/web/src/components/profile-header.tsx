'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui-components';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

import { cn } from '@/lib/utils';

export function ProfileHeader({ userEmail, className }: { userEmail?: string | null, className?: string }) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        // Using window.location to force full reload and clear any state
        window.location.href = "/";
    };

    return (
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8", className)}>
            <div className="flex items-center gap-4">
                {/* Fake Avatar */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-background">
                    {userEmail ? userEmail[0].toUpperCase() : 'G'}
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                        {userEmail ? userEmail.split('@')[0] : 'Guest User'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Member since 2024 • Premium
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full border">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Theme</span>
                    <ThemeToggle />
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </div>
    );
}
