"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Camera,
  ShoppingBag,
  Palette,
  ChevronRight,
  Globe,
  History,
  ArrowRight,
  Menu,
  X,
  ScanFace,
  Network,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { usePWAInstall } from "@/components/pwa-provider";

export default function LandingPage() {
  // const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const { install } = usePWAInstall();

  const toggleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-white text-neutral-black font-sans selection:bg-tertiary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-white/90 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold italic">C</span>
            </div>
            <span className="font-serif text-2xl font-black tracking-tighter uppercase">CultureLense</span>
          </div>

          <Button onClick={handleLogin} className="rounded-full border-neutral-black font-bold uppercase tracking-widest text-[10px] px-6 hover:bg-neutral-black/80 hover:text-white transition-all">
            Login
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Badge className="mb-6 bg-secondary/10 text-secondary border-none px-4 py-1 uppercase tracking-[0.2em] text-[10px] font-black">
                  The Future of Sculpture
                </Badge>
                <h1 className="text-7xl md:text-8xl font-serif font-black leading-[0.9] tracking-tighter mb-8 italic">
                  Soul in <span className="text-secondary not-italic">Stone.</span>
                </h1>
                <div className="max-w-xl mb-10 space-y-6">
                  <p className="text-xl text-neutral-black/80 leading-relaxed font-light">
                    For centuries, the stories of our gods and ancestors have been locked in stone—silent, static, and slowly fading. <span className="font-medium text-neutral-black">CultureLense changes that.</span>
                  </p>
                  <p className="text-lg text-neutral-black/70 leading-relaxed font-light">
                    We are building the <span className="font-bold text-primary">Shazam for Heritage</span>: a tool that doesn't just see a statue, but understands its soul. By merging sophisticated AI with deep mythological context, we turn every smartphone into a digital archaeologist, ensuring that the wisdom of the past isn't just remembered—it's experienced.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleLogin} size="lg" className="rounded-full h-16 px-10 bg-primary text-white hover:bg-primary/90 text-base font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">
                    Start Scanning <Scan className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full h-16 px-10 border-black/20 text-base font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">
                    Marketplace <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group"
              >
                <Image
                  src="/sclupture/ganesh.webp"
                  alt="Ancient Greek Statue"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Scanning UI Mockup */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="absolute left-0 w-full h-[2px] bg-white shadow-[0_0_20px_2px_white] z-20"
                    />
                  )}
                </AnimatePresence>

                <div className="absolute bottom-1 sm:bottom-5 left-10 right-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="p-4 sm:p-6 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-serif text-2xl font-bold italic">Ganesha</h3>
                        <p className="text-white/60 text-sm">Hindu Deity • Remover of Obstacles</p>
                      </div>
                    </div>
                    <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                      Ganesha, the elephant-headed son of Shiva and Parvati, is revered as the remover of obstacles and the god of wisdom, learning, and new beginnings. He is traditionally worshipped before major undertakings.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        </section>

        {/* Features Grid */}
        {/* Mission Section */}
        {/* Mission Section */}
        <section className="relative overflow-hidden bg-neutral-950 text-white">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
           
           {/* Fade Transitions - Extended for smoothness */}
           <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white via-white/40 to-transparent z-10 pointer-events-none" />
           <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-white via-white/40 to-transparent z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-20 py-48">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Left Content */}
              <div className="flex-1 space-y-10">
                <div>
                  <Badge className="mb-4 bg-white/10 text-white border-0 px-3 py-1 uppercase tracking-widest text-[10px] font-bold backdrop-blur-md">
                    Our Mission
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight text-white italic tracking-tighter drop-shadow-2xl">
                    Preserve. <br/>
                    Promote. <br/>
                    <span className="text-secondary not-italic">Prosper.</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Awaken History",
                      desc: "Decoding iconography with AI to reveal myths behind the marble.",
                      color: "bg-blue-500/20 text-blue-300" 
                    },
                    {
                      title: "Preserve Legacy",
                      desc: "Creating an immutable digital archive to safeguard Nepal's heritage.",
                      color: "bg-amber-500/20 text-amber-300"
                    },
                    {
                      title: "Empower Artisans",
                      desc: "Connecting local creators with global collectors for an economic renaissance.",
                      color: "bg-emerald-500/20 text-emerald-300"
                    },
                    {
                      title: "Democratize Access",
                      desc: "Making cultural wisdom universally accessible across language barriers.",
                       color: "bg-purple-500/20 text-purple-300"
                    }
                  ].map((goal, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-xl"
                    >
                      <div className={`w-2 h-2 rounded-full mb-4 ${goal.color.split(" ")[0].replace("/20", "")}`} />
                      <h3 className="text-xl font-bold mb-2 text-white">{goal.title}</h3>
                      <p className="text-sm text-neutral-200 leading-relaxed font-light">{goal.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Image */}
              <div className="flex-1 relative w-full aspect-[4/5] lg:aspect-square max-w-lg lg:max-w-none mx-auto">
                 <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-[3rem] rotate-3 blur-2xl" />
                 <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    <Image
                      src="/sclupture/shiva.webp"
                      alt="Cultural preservation"
                      fill
                      className="object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                       <p className="text-xs font-mono text-white/60 uppercase tracking-widest mb-2">Figure 01</p>
                       <p className="text-2xl font-serif italic text-white">The Guardian of Lineage</p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </section>

        {/* Marketplace/Exhibition Section */}
        <section id="exhibition" className="py-24 bg-neutral-black text-txt">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <Badge className="mb-4 bg-white/10 text-txt border-none px-4 py-1 uppercase tracking-widest text-[10px] font-black">
                  Curated Marketplace
                </Badge>
                <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight italic">
                  The <span className="not-italic text-txt">Marketplace.</span>
                </h2>
              </div>
              <Button variant="link" className="text-txt font-black uppercase tracking-[0.3em] text-[10px] hover:text-secondary flex items-center gap-2 px-0">
                View All Creations <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  img: "/sclupture/shiva.webp",
                  title: "The Cosmic Dancer",
                  artist: "Marcus Aurelius II",
                },
                {
                  img: "/sclupture/buddha.webp",
                  title: "Awakened Silence",
                  artist: "Elena Vance",
                },
                {
                  img: "/sclupture/hanuman.webp",
                  title: "Son of The Wind",
                  artist: "Kenzo Arata",
                },
                {
                  img: "/sclupture/ganesh.webp",
                  title: "Divine Beginning",
                  artist: "Sofia Russo",
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-lg font-bold italic group-hover:text-secondary transition-colors">{item.title}</h4>
                      <p className="text-white/40 text-xs uppercase tracking-widest">{item.artist}</p>
                    </div>
                    <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 max-w-4xl">
              <Badge className="mb-6 bg-primary/10 text-primary border-none px-4 py-1 uppercase tracking-widest text-[10px] font-black">
                The Methodology
              </Badge>
              <h2 className="text-5xl md:text-6xl font-serif font-black mb-6 italic text-neutral-black leading-tight">
                We didn't just build an app; we built a <span className="text-secondary not-italic">Cultural Intelligence Engine.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI That "Sees" Culture',
                  desc: 'Our dual-core AI system goes beyond pixel matching. It understands iconography—interpreting posture, symbols, and style to identify deities with unprecedented accuracy, even in low light or weather-worn conditions.',
                  icon: <ScanFace className="w-8 h-8" />
                },
                {
                  title: 'The Knowledge Web',
                  desc: 'We are mapping the "DNA" of our mythology. Our proprietary Cultural Graph links every deity to their lineage, temples, and legends, turning isolated facts into a living tapestry of knowledge.',
                   icon: <Network className="w-8 h-8" />
                },
                {
                  title: 'Trust-Based Commerce',
                  desc: 'We enable culture to sustain itself. Our verified vendor system and secure escrow transactions ensure that every purchase is authentic, transparent, and directly supports the preservation of the art form.',
                   icon: <ShieldCheck className="w-8 h-8" />
                }
              ].map((item, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-2xl hover:shadow-neutral-black/5">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-black text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4 italic group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-neutral-black/60 leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Creators Section */}
        <section id="creators" className="py-32 bg-neutral-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <Badge className="mb-6 bg-primary text-white px-4 py-1 uppercase tracking-widest text-[10px] font-black">
                  For Vendors
                </Badge>
                <h2 className="text-7xl font-serif font-black leading-[0.9] tracking-tighter mb-8 italic">
                  Turn your studio into a <span className="text-secondary not-italic">Stage.</span>
                </h2>
                <p className="text-xl text-neutral-black/80 mb-10 leading-relaxed font-light">
                  CultureLense isn&apos;t just a store—it&apos;s a platform for promotion. Connect with serious collectors, showcase your process through AR, and build your legacy in the digital age.
                </p>
                <ul className="space-y-6 mb-12">
                  {[
                    "Zero-commission featured listings",
                    "High-fidelity 3D scanning support",
                    "Direct artist-to-collector messaging",
                    "Global shipping and insurance logistics"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-neutral-black font-bold uppercase tracking-widest text-xs">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="rounded-full h-16 px-10 bg-primary text-white hover:bg-primary/90 text-base font-black uppercase tracking-widest">
                  Apply as Vendor
                </Button>
              </div>

              <div className="relative">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden z-10 shadow-2xl">
                  <Image
                    src="/sclupture/hanuman.webp"
                    alt="Artist working on sculpture"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Decorative floating card */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-16 sm:-bottom-8 sm:-left-10 z-[20] p-4 sm:p-8 max-w-xs rounded-3xl bg-white/20 backdrop-blur-md shadow-2xl border border-white/30"

                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-tertiary text-txt flex items-center justify-center">
                      <Palette color="black" className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xl">Promotion Tier</h5>
                      <p className="text-sm font-semibold text-txt uppercase tracking-widest">Elite Member</p>
                    </div>
                  </div>
                  <p className="text-sm text-txt font-light">
                    &quot;CultureLense increased my gallery visits by 300% through their AR showcase feature.&quot;
                  </p>
                </motion.div>

                {/* Background circles */}
                <div className="absolute -top-10 -right-10 w-64 h-64 border-2 border-secondary/30 rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary/60 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-serif font-black text-white mb-8 italic">Ready to see the <span className="not-italic text-accent">Unseen?</span></h2>
                <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
                  Join the world&apos;s most advanced sculpture community. Download the app to start scanning or browse the exhibition.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <Button onClick={install} size="lg" className="rounded-full h-16 px-10 bg-white text-black hover:bg-zinc-200 text-base font-black uppercase tracking-widest">
                    Get the App
                  </Button>
                  <Button size="lg" className="rounded-full h-16 px-10 border-white/20 text-white hover:bg-white/10 text-base font-black uppercase tracking-widest">
                    Create Account
                  </Button>
                </div>
              </div>

              {/* Background light effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-white border-t border-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-serif text-xl font-bold italic">C</span>
                </div>
                <span className="font-serif text-2xl font-black tracking-tighter uppercase">CultureLense</span>
              </div>
              <p className="text-neutral-black/60 max-w-sm text-lg font-light leading-relaxed">
                The world&apos;s leading platform for sculpture identification, promotion, and collection. Bridging 5,000 years of art with modern spatial AI.
              </p>
            </div>

            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8">Navigation</h5>
              <ul className="space-y-4 text-sm font-medium text-neutral-black/80">
                <li><a href="#" className="hover:text-black transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Artist Directory</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Scanning Guide</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Market Signals</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8">Connect</h5>
              <ul className="space-y-4 text-sm font-medium text-neutral-black/80">
                <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-black transition-colors">X (Twitter)</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-primary/20 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-neutral-black/40 font-medium">© 2025 CULTURELENSE ART TECHNOLOGIES. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-neutral-black/40">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
