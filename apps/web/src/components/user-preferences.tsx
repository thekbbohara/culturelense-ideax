"use client";

import React, { useState } from "react";
import { Card, CardContent, Button } from "./ui-components";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Settings, Save, Bell, Globe, Moon } from "lucide-react";
import { updateUserPreferences } from "@/actions/user";
import { useRouter } from "next/navigation";

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

  const handleSave = async () => {
    setLoading(true);
    const res = await updateUserPreferences(userId, formData);
    if (res.success) {
      router.refresh();
      // Ideally show toast here
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> Preferences
           </h3>
           <Button 
             size="sm" 
             onClick={handleSave} 
             disabled={loading}
             className="gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
           </Button>
        </div>

        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-neutral-50/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                   <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-base font-medium">Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates about your orders and listings.</p>
                </div>
             </div>
             <Switch 
                id="notifications" 
                checked={formData.enableNotifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableNotifications: checked }))}
             />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-neutral-50/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                   <Globe className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                    <Label htmlFor="language" className="text-base font-medium">Language</Label>
                    <p className="text-xs text-muted-foreground">Select your preferred language.</p>
                </div>
             </div>
             <select 
                id="language"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
             >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="hi">Hindi</option>
             </select>
          </div>

           {/* Theme */}
           <div className="flex items-center justify-between p-3 rounded-lg border bg-neutral-50/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                   <Moon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                    <Label htmlFor="theme" className="text-base font-medium">App Theme</Label>
                    <p className="text-xs text-muted-foreground">Choose your visual preference.</p>
                </div>
             </div>
             <select 
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
             >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
             </select>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
