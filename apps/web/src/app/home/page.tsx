"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui-components";
import { User, LogOut, Scan, ArrowRight, Search, Sparkles } from "lucide-react";
import { checkUserHistory } from "@/actions/home";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const [user, setUser] = React.useState<any>(null);
  const [hasHistory, setHasHistory] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { hasHistory } = await checkUserHistory();
      setHasHistory(hasHistory);
    };
    init();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (hasHistory === null) {
      return <div className="min-h-screen bg-neutral-white flex items-center justify-center">
          <div className="animate-pulse w-10 h-10 bg-primary/20 rounded-full" />
      </div>;
  }

  return (
    <div className="min-h-screen bg-neutral-white text-neutral-black font-sans">
        <nav className="fixed top-0 w-full z-50 bg-neutral-white/90 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold italic">C</span>
            </div>
            <span className="font-serif text-2xl font-black tracking-tighter uppercase">CultureLense</span>
          </div>

          <Button onClick={handleLogout} variant="outline" className="rounded-full border-neutral-black font-bold uppercase tracking-widest text-[10px] px-6 hover:bg-neutral-black hover:text-white transition-colors flex items-center gap-2">
             Logout <LogOut className="w-3 h-3" />
            </Button>
        </div>
      </nav>

      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        {!hasHistory ? (
            // EMPTY STATE: Large Scan Area
            <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl aspect-video bg-white rounded-[3rem] border-2 border-primary/10 shadow-2xl shadow-primary/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-lg z-10"
                    >
                        <Scan className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl font-serif font-black italic mb-2 z-10">Start Scanning</h2>
                    <p className="text-neutral-black/50 z-10">Point at any sculpture to identify</p>

                    {/* Decorative arrow annotation from wireframe logic */}
                    <div className="absolute -right-32 top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="flex items-center gap-4">
                            <ArrowRight className="w-8 h-8 text-neutral-black/30 rotate-180" />
                            <span className="font-handwriting text-neutral-black/40 text-sm rotate-6">Start your journey here</span>
                        </div>
                    </div>
                 </motion.div>

                 <div className="mt-12 text-center">
                     <p className="text-sm font-bold uppercase tracking-widest text-neutral-black/30 mb-4">Or manually search</p>
                     <div className="flex gap-4">
                        <Button variant="outline" className="rounded-full border-neutral-black/10 px-8 h-12 hover:bg-neutral-black hover:text-white transition-colors">
                            <Search className="w-4 h-4 mr-2" /> Search Database
                        </Button>
                     </div>
                 </div>
            </div>
        ) : (
            // POPULATED STATE: Featured & Recommended
            <div className="space-y-16">
                {/* Featured Section */}
                <div>
                   <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        <h2 className="text-2xl font-serif font-black italic">Featured Today</h2>
                   </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {[
                            { title: "Shiva Nataraja", img: "/sclupture/shiva.webp", price: "4.5 ETH" },
                            { title: "Hanuman", img: "/sclupture/hanuman.webp", price: "6.2 ETH" },
                            { title: "Ganesha", img: "/sclupture/ganesh.webp", price: "3.5 ETH" }
                         ].map((item, i) => (
                             <motion.div 
                                key={i}
                                whileHover={{ y: -5 }}
                                className="aspect-[4/3] relative rounded-[2rem] overflow-hidden group cursor-pointer border border-primary/5 bg-white shadow-sm hover:shadow-xl hover:shadow-secondary/10 transition-all"
                             >
                                <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="font-serif font-bold text-xl italic">{item.title}</h3>
                                    <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">{item.price}</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {[
                            { title: "Modern Muse", img: "/sclupture/buddha.webp", tag: "Zen Collection" },
                            { title: "Vedic Artifacts", img: "/sclupture/shiva.webp", tag: "New Arrival" },
                            { title: "Temple Series", img: "/sclupture/hanuman.webp", tag: "Popular" }
                         ].map((item, i) => (
                             <Card 
                                key={i}
                                className="p-4 rounded-[2rem] bg-white border border-neutral-black/5 hover:border-secondary/30 transition-all hover:shadow-lg cursor-pointer h-full"
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
