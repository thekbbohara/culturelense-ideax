"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { toast } from "sonner";

interface PWAContextType {
  isInstallable: boolean;
  install: () => Promise<void>;
  deferredPrompt: any;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if event already fired
    if ((window as any).pwaEvent) {
        setDeferredPrompt((window as any).pwaEvent);
        setIsInstallable(true);
    }

    window.addEventListener('appinstalled', () => {
        setDeferredPrompt(null);
        setIsInstallable(false);
        (window as any).pwaEvent = null;
    });

    return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("appinstalled", () => {});
    }
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
        toast("Install not available", {
            description: "App is already installed or browser doesn't support PWA installation.",
        });
        return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return (
    <PWAContext.Provider value={{ isInstallable, install, deferredPrompt }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWAInstall must be used within a PWAProvider");
  }
  return context;
}
