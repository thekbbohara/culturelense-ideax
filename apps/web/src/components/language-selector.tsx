"use client";

import React, { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { changeLanguage } from "@/lib/google-translate";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { updateUserPreferences } from "@/actions/user";

interface LanguageSelectorProps {
  userId?: string;
  variant?: "default" | "minimal";
  initialValue?: string;
}

export function LanguageSelector({ userId, variant = "default", initialValue }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState(initialValue || "en");

  useEffect(() => {
    // Sync state with local storage on mount
    const saved = localStorage.getItem("preferred_language");
    if (saved) setCurrentLang(saved);
  }, []);

  const handleLanguageChange = async (val: string) => {
    setCurrentLang(val);
    localStorage.setItem("preferred_language", val);

    if (userId) {
      await updateUserPreferences(userId, { language: val });
    }

    changeLanguage(val);
  };

  if (variant === "minimal") {
      return (
        <div className="relative group">
            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-[300px] overflow-y-auto">
                <div className="p-2 grid gap-1">
                    {LANGUAGES.map((lang) => (
                         <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                "text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors truncate w-full",
                                currentLang === lang.code && "bg-muted font-medium text-primary"
                            )}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="w-full appearance-none bg-muted hover:bg-muted/80 border-none text-foreground text-sm font-medium rounded-xl px-4 py-3 pr-10 cursor-pointer focus:ring-1 focus:ring-ring transition-colors"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 bottom-6 right-6 flex items-center pr-3 pointer-events-none text-muted-foreground mr-0 h-full top-0">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
