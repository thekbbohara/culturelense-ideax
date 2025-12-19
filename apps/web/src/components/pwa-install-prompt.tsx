"use client";

import React, { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui-components";
import { motion, AnimatePresence } from "framer-motion";
import { usePWAInstall } from "@/components/pwa-provider";

export function PWAInstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-24 right-6 z-50 flex items-center gap-3 p-4 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl max-w-sm"
        >
            <div className="flex-1">
                <h4 className="font-bold text-sm text-foreground">Install App</h4>
                <p className="text-xs text-muted-foreground">Add to home screen for better experience</p>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    size="sm" 
                    onClick={install}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs font-bold"
                >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Install
                </Button>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    </AnimatePresence>
  );
}
