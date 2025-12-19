"use client";

import React from "react";
import {
  Home,
  ShoppingBag,
  Scan,
  Heart,
  User,
  Globe
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

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[5000] w-auto">
      <div className="relative flex items-center justify-between gap-2 px-6 py-3 rounded-full bg-neutral-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-w-[320px]">
        {docsConfigs.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.logo;
          const isScan = item.name === "Scan";

          if (isScan) {
            return (
              <div key={item.name} className="relative -mt-12 mx-2">
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-neutral-white"
                  >
                    <Scan className="w-8 h-8 text-white" />
                  </motion.div>
                </Link>
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all",
                isActive ? "text-primary bg-primary/10" : "text-neutral-black/60 hover:text-neutral-black hover:bg-neutral-black/5"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
