"use client";

import { useEffect, useState } from "react";
import { Button } from "@culturelense/ui";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <p className="text-sm text-gray-700 mb-2">
          To install this app on your iOS device, tap the share button
          <span className="inline-block mx-1">⎋</span>
          and then "Add to Home Screen"
          <span className="inline-block mx-1">➕</span>.
        </p>
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 p-4 flex justify-center z-50">
      <Button
        onClick={handleInstallClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        Install App
      </Button>
    </div>
  );
}
