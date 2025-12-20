"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Type, Globe, Check, ChevronDown } from "lucide-react";
import { updateUserPreferences } from "@/actions/user";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { changeLanguage } from "@/lib/google-translate";

interface ProfileSettingsProps {
  userId: string;
  initialPreferences: {
    language?: string | null;
    theme?: string | null;
  } | null;
}

export function ProfileSettings({ userId, initialPreferences }: ProfileSettingsProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [language, setLanguage] = useState(initialPreferences?.language || "en");
  const [themePreference, setThemePreference] = useState(initialPreferences?.theme || "system");

  // Apply saved language on mount
  useEffect(() => {
    if (language && language !== 'en') {
      changeLanguage(language);
    }
  }, []);

  const handleThemeChange = async (val: string) => {
    setThemePreference(val);
    setTheme(val);
    if (userId) {
      await updateUserPreferences(userId, { theme: val });
    }
  };

  const handleLanguageChange = async (val: string) => {
    setLanguage(val);
    if (userId) {
      await updateUserPreferences(userId, { language: val });
      // Save to localStorage for persistence
      localStorage.setItem('preferred_language', val);
      // Trigger Google Translate
      changeLanguage(val);
    }
  };

  return (
    <div className="space-y-6">

      {/* Visual Mode Block */}
      <div className="bg-card rounded-2xl border shadow-sm group hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 text-muted-foreground group-hover:text-foreground transition-colors p-6 pb-0">
          <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
            <Moon className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest">Visual Mode</span>
        </div>

        <div className="grid grid-cols-3 gap-2 px-6 pb-6">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'Auto', icon: Monitor },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200",
                themePreference === option.id
                  ? "bg-foreground border-foreground text-background shadow-lg"
                  : "bg-card border text-muted-foreground hover:border-foreground/20 hover:bg-muted"
              )}
            >
              <option.icon className={cn("w-5 h-5", themePreference === option.id ? "text-background" : "text-muted-foreground")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Block */}
      <div className="bg-card rounded-2xl border shadow-sm group hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-2 p-6 pb-0">
          <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest">Interface</span>
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full appearance-none bg-muted hover:bg-muted/80 border-none text-foreground text-sm font-medium rounded-xl px-4 py-3 pr-10 cursor-pointer focus:ring-1 focus:ring-ring transition-colors"
          >
            <option value="en">English (Default)</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ne">नेपाली (Nepali)</option>
          </select>
          <div className="absolute inset-y-0 bottom-6 right-6 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

    </div>
  );
}
