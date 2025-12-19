"use client";
import React, { useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Settings, Save, Bell, Globe, Moon } from "lucide-react";
import { Button } from "./ui-components"; // Re-import Button if needed for inline save
import { updateUserPreferences } from "@/actions/user";
import { useRouter } from "next/navigation";
import { ProfileRow } from "./profile-row";

interface UserPreferencesProps {
  userId: string;
  preferences: {
    enableNotifications?: boolean | null;
    language?: string | null;
    theme?: string | null;
  } | null;
}

export function UserPreferences({ userId, preferences }: UserPreferencesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    enableNotifications: preferences?.enableNotifications ?? true,
    language: preferences?.language ?? "en",
    theme: preferences?.theme ?? "system",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updateFormData = (key: string, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
      setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await updateUserPreferences(userId, formData);
    if (res.success) {
      router.refresh();
      setHasChanges(false);
    }
    setLoading(false);
  };

  // Removed internal PreferenceRow in favor of shared ProfileRow

  return (
    <div className="space-y-2">
       {/* Save Banner if changes exist */}
       {hasChanges && (
           <div className="flex items-center justify-between bg-primary/10 text-primary px-4 py-2 rounded-lg mb-4 text-sm animate-in fade-in slide-in-from-top-2">
               <span>You have unsaved changes.</span>
               <Button size="sm" onClick={handleSave} disabled={loading} className="h-7 text-xs">
                   {loading ? "Saving..." : "Save Config"}
               </Button>
           </div>
       )}

       <ProfileRow 
          icon={Bell}
          label="Weekly Newsletter"
        >
            <Switch 
                checked={formData.enableNotifications}
                onCheckedChange={(checked) => updateFormData('enableNotifications', checked)}
            />
       </ProfileRow>

       <ProfileRow 
          icon={Globe}
          label="Language"
        >
             <select 
                value={formData.language}
                onChange={(e) => updateFormData('language', e.target.value)}
                className="bg-transparent text-sm text-foreground border border-input rounded-md px-2 py-1 focus:ring-1 focus:ring-ring focus:outline-none"
             >
                <option value="en" className="bg-popover text-popover-foreground">English</option>
                <option value="es" className="bg-popover text-popover-foreground">Spanish</option>
                <option value="fr" className="bg-popover text-popover-foreground">French</option>
             </select>
       </ProfileRow>
       
       <ProfileRow 
          icon={Moon}
          label="Theme"
        >
             <select 
                value={formData.theme}
                onChange={(e) => updateFormData('theme', e.target.value)}
                className="bg-transparent text-sm text-foreground border border-input rounded-md px-2 py-1 focus:ring-1 focus:ring-ring focus:outline-none"
             >
                <option value="system" className="bg-popover text-popover-foreground">System</option>
                <option value="light" className="bg-popover text-popover-foreground">Light</option>
                <option value="dark" className="bg-popover text-popover-foreground">Dark</option>
             </select>
       </ProfileRow>
       
    </div>
  );
}
