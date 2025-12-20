"use client";

import React from "react";
import {
  Home,
  ShoppingBag,
  Scan,
  User,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const docsConfigs = [
  {
    name: "Home",
    href: "/home",
    logo: Home,
  },
  {
    name: "Explore",
    href: "/explore",
    logo: Globe,
  },
  {
    name: "Scan",
    href: "/scan",
    logo: Scan,
  },
  {
    name: "Market",
    href: "/marketplace",
    logo: ShoppingBag,
  },
  {
    name: "Profile",
    href: "/profile",
    logo: User,
  },
];

export function Dock() {
  const pathname = usePathname();
  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-auto max-w-[95vw]">
      {/* Ambient Glow behind the dock */}
      <div className="absolute -inset-4 bg-gradient-to-t from-primary/20 to-transparent blur-3xl rounded-full opacity-50 pointer-events-none" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(
          "relative flex items-center justify-between gap-3 md:gap-2",
          "px-6 py-3 md:px-4 md:py-2.5",
          "rounded-[2.5rem] md:rounded-full", // Rounder on mobile
          "bg-card/85 backdrop-blur-xl", // Glass effect
          "border border-white/20 dark:border-white/10", // Subtle lighting border
          "shadow-2xl shadow-black/10 dark:shadow-black/40",
          "min-w-[340px] md:min-w-fit" // Wider on mobile
        )}
      >
        {docsConfigs.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.logo;
          const isScan = item.name === "Scan";

          // Special "Lens" Button for Scan
          if (isScan) {
            return (
              <div key={item.name} className="relative mx-2 group">
                <Link href={item.href} className="relative block">
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14", // Bigger on mobile
                      "bg-gradient-to-br from-primary to-primary/80",
                      "rounded-full flex items-center justify-center",
                      "shadow-lg shadow-primary/30",
                      "border-[4px] border-background", // Cutout effect
                      "relative -mt-8 md:-mt-6", // Pop out effect
                      "z-20"
                    )}
                  >
                    <Scan className="w-7 h-7 md:w-6 md:h-6 text-primary-foreground" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </motion.div>
                </Link>
              </div>
            )
          }

          // Standard Nav Items
          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredTab(item.name)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative z-10"
            >
              <div className={cn(
                "relative flex flex-col items-center justify-center",
                "w-10 h-10 md:w-12 md:h-12", // Touch targets larger on mobile
                "rounded-full transition-all duration-300",
                "cursor-pointer"
              )}>

                {/* Active Indicator (Sliding Pill) */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover Indicator (Subtle Dot) */}
                {hoveredTab === item.name && !isActive && (
                  <motion.div
                    layoutId="hover-pill"
                    className="absolute inset-2 bg-stxt/5 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon
                    className={cn(
                      "w-6 h-6 md:w-5 md:h-5 transition-all duration-300",
                      isActive ? "text-primary" : "text-stxt group-hover:text-txt",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Active Dot indicator below icon */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: isActive ? 4 : 0,
                      opacity: isActive ? 1 : 0
                    }}
                    className="h-1 bg-primary rounded-full absolute -bottom-2"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}