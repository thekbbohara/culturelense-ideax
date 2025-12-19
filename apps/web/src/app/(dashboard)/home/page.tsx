"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui-components";
import { Scan, ArrowRight, Search, Sparkles } from "lucide-react";
import { checkUserHistory } from "@/actions/home";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const [hasHistory, setHasHistory] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const init = async () => {
      const { hasHistory } = await checkUserHistory();
      setHasHistory(hasHistory);
    };
    init();
  }, []);



  if (hasHistory === null) {
      return <div className="min-h-screen bg-neutral-white flex items-center justify-center">
          <div className="animate-pulse w-10 h-10 bg-primary/20 rounded-full" />
      </div>;
  }

  return (
    <div className="min-h-screen bg-neutral-white text-neutral-black font-sans">
      <main className="pt-20 min-h-screen flex flex-col w-full overflow-x-hidden">
        {!hasHistory ? (
            // EMPTY STATE: Immersive Scan
            <div className="flex-1 flex flex-col items-center justify-center relative bg-neutral-white overflow-hidden">
                 {/* Camera view finder lines */}
                 <div className="absolute inset-4 sm:inset-8 border border-neutral-black/10 rounded-[2rem] sm:rounded-[3rem] pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl sm:rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl sm:rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl sm:rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-primary rounded-br-2xl sm:rounded-br-3xl" />
                 </div>

                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-full flex flex-col items-center justify-center z-10 cursor-pointer"
                 >
                    <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 animate-pulse">
                        <Scan className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif font-black italic mb-2">Tap to Scan</h2>
                    <p className="text-neutral-black/50">Point at art to identify</p>
                 </motion.div>
            </div>
        ) : (
            // POPULATED STATE: Featured & Recommended
            <div className="space-y-16 px-6 max-w-7xl mx-auto mt-12">
                {/* Featured Section */}
                <div>
                   <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        <h2 className="text-2xl font-serif font-black italic">Featured Today</h2>
                   </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide sm:flex-wrap max-w-[calc(100vw-3rem)]">
                         {[
                            { title: "Shiva Nataraja", img: "/sclupture/shiva.webp", type: "Sculpture" },
                            { title: "Hanuman", img: "/sclupture/hanuman.webp", type: "Artifact" },
                            { title: "Ganesha", img: "/sclupture/ganesh.webp", type: "Statue" }
                         ].map((item, i) => (
                             <motion.div 
                                key={i}
                                whileHover={{ y: -5 }}
                                className="min-w-[75vw] sm:min-w-0 shrink-0 sm:shrink sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.33%-1.07rem)] aspect-[4/3] relative rounded-[2rem] overflow-hidden group cursor-pointer border border-primary/5 bg-white shadow-sm hover:shadow-xl hover:shadow-secondary/10 transition-all"
                             >
                                <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="font-serif font-bold text-xl italic">{item.title}</h3>
                                    <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">{item.type}</p>
                                </div>
                             </motion.div>
                         ))}
                    </div>
                </div>

                {/* Recommended Section */}
                <div>
                   <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <h2 className="text-2xl font-serif font-black italic">Recommended for You</h2>
                   </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide sm:flex-wrap max-w-[calc(100vw-3rem)]">
                         {[
                            { title: "Modern Muse", img: "/sclupture/buddha.webp", tag: "Zen Collection" },
                            { title: "Vedic Artifacts", img: "/sclupture/shiva.webp", tag: "New Arrival" },
                            { title: "Temple Series", img: "/sclupture/hanuman.webp", tag: "Popular" }
                         ].map((item, i) => (
                             <Card 
                                key={i}
                                className="min-w-[60vw] sm:min-w-0 shrink-0 sm:shrink sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)] p-4 rounded-[2rem] bg-white border border-neutral-black/5 hover:border-secondary/30 transition-all hover:shadow-lg cursor-pointer h-full"
                             >
                                <div className="aspect-square relative rounded-2xl overflow-hidden mb-4 bg-neutral-white">
                                    <Image src={item.img} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="px-2 pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-2">{item.tag}</span>
                                    <h3 className="font-serif font-bold text-lg">{item.title}</h3>
                                </div>
                             </Card>
                         ))}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
