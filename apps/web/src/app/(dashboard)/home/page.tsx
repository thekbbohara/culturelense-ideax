'use client';

import React from 'react';
import { Card, Skeleton } from '@/components/ui-components';
import { Scan, ArrowRight } from 'lucide-react';
import { checkUserHistory } from '@/actions/home';
import { getRecentSearchedEntities } from '@/actions/history';
import { getRelatedEntities } from '@/actions/entities';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

function formatText(text: string) {
  return text
    .replace(/[-_]+/g, ' ') // replace - and _ with space
    .replace(/\s+/g, ' ') // remove extra spaces
    .trim();
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function HomePage() {
  const router = useRouter();

  // 1. Check History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['user-history'],
    queryFn: () => checkUserHistory(),
    staleTime: 5 * 60 * 1000,
  });

  const hasHistory = historyData?.hasHistory ?? null;

  // 2. Fetch Recent Entities
  const { data: recentEntities = [], isLoading: isRecentLoading } = useQuery({
    queryKey: ['recent-entities'],
    queryFn: async () => {
      const { data } = await getRecentSearchedEntities();
      return data || [];
    },
    enabled: !!hasHistory,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Recommendations
  const firstEntityId = recentEntities?.[0]?.id;
  const { data: recommendedEntities = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['recommended-entities', firstEntityId],
    queryFn: () => getRelatedEntities(firstEntityId as string),
    enabled: !!firstEntityId,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isHistoryLoading || (hasHistory && isRecentLoading);

  // Initial Loading Skeleton
  if (isHistoryLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start space-y-6 w-full">
            <Skeleton className="h-12 w-3/4 rounded-3xl bg-primary/10" />
            <div className="space-y-3 w-full flex flex-col items-center lg:items-start">
              <Skeleton className="h-4 w-full max-w-sm rounded-full" />
              <Skeleton className="h-4 w-2/3 max-w-xs rounded-full" />
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-border/50 flex items-center justify-center bg-card/50">
              <Skeleton className="w-32 h-32 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main className="pb-32 min-h-screen flex flex-col w-full overflow-x-hidden">
        {!hasHistory ? (
          // EMPTY STATE
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl lg:text-6xl font-serif font-black italic text-txt leading-tight">
                    Discover the <span className="text-primary">Divine</span>
                  </h1>
                  <p className="mt-4 text-stxt text-lg lg:text-xl max-w-md mx-auto lg:mx-0">
                    Point your camera at art, statues, or symbols to instantly identify deities.
                  </p>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/scan')}
                  className="hidden lg:flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                  <Scan className="w-5 h-5" />
                  <span>Start Scanning</span>
                </motion.button>
              </div>
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 cursor-pointer group"
                  onClick={() => router.push('/scan')}
                >
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-card border border-border text-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:border-primary/50 transition-colors duration-500">
                    <Scan className="w-10 h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-transform" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          // POPULATED STATE
          <div className="space-y-12 lg:space-y-20 px-0 lg:px-6 max-w-7xl mx-auto pt-8 lg:pt-16 w-full">
            {/* =======================================================
                            FEATURED SECTION
                           ======================================================= */}
            <section>
              <div className="px-6 flex items-center justify-between mb-6 lg:mb-8">
                <div className="px-6 flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-2 h-8 rounded-full bg-secondary" />
                  <h2 className="text-2xl lg:text-3xl font-serif font-black italic text-txt">
                    Featuerd Today
                  </h2>
                </div>
              </div>

              {isLoading ? (
                <div className="px-6 lg:px-0">
                  <Skeleton className="w-full h-[400px] rounded-[2rem]" />
                </div>
              ) : recentEntities.length > 0 ? (
                <>
                  {/* --- MOBILE VIEW: Horizontal Scroll --- */}
                  <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 no-scrollbar -mx-0">
                    {recentEntities.map((item: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => router.push(`/god/${item.slug}`)}
                        className="snap-center shrink-0 w-[85vw] sm:w-[400px] h-[450px] relative rounded-[2rem] overflow-hidden shadow-lg border border-border/50 bg-card"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-stxt">
                            No Image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                              {item.type}
                            </span>
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-white mb-2"></h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                            <span>Explore Mythology</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* --- DESKTOP VIEW: Bento Grid --- */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[500px]">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => router.push(`/god/${recentEntities[0]?.slug}`)}
                      className="col-span-8 relative rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                    >
                      {recentEntities[0]?.imageUrl && (
                        <Image
                          src={recentEntities[0]?.imageUrl}
                          alt={recentEntities[0]?.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-10 w-full">
                        <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                          {recentEntities[0]?.type}
                        </span>
                        <h3 className="text-5xl font-serif font-bold text-white mb-3">
                          {recentEntities[0]?.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                          <span className="text-base font-medium">Read Full Story</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>

                    <div className="col-span-4 flex flex-col gap-6">
                      {recentEntities.slice(1, 3).map((item: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => router.push(`/god/${item.slug}`)}
                          className="flex-1 relative rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-lg transition-all"
                        >
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="font-serif font-bold text-xl text-white truncate">
                              {formatText(item.name)}
                            </h3>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">
                              {item.type}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mx-6 lg:mx-0 py-20 text-center bg-card rounded-[2rem] border border-dashed border-border text-stxt font-medium">
                  Search for a deity to see it featured here.
                </div>
              )}
            </section>

            {/* =======================================================
                            RECOMMENDED SECTION (ENHANCED UI)
                           ======================================================= */}
            <section className="pb-10">
              <div className="px-6 flex items-center gap-3 mb-6 lg:mb-8">
                <div className="w-2 h-8 rounded-full bg-primary" />
                <h2 className="text-2xl lg:text-3xl font-serif font-black italic text-txt">
                  Recommended for You
                </h2>
              </div>

              {isRecommendedLoading && hasHistory ? (
                <div className="flex gap-4 overflow-hidden px-6 lg:grid lg:grid-cols-5 lg:px-0">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <Card
                      key={i}
                      className="min-w-[200px] p-0 rounded-[2rem] bg-card border border-border h-[320px] shadow-none overflow-hidden relative"
                    >
                      <Skeleton className="w-full h-full bg-muted" />
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex overflow-x-auto pb-8 px-6 gap-5 snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-5 lg:gap-6 lg:px-0 lg:pb-0"
                >
                  {recommendedEntities.length > 0 ? (
                    recommendedEntities.map((item: any, i: number) => (
                      <motion.div key={i} variants={itemVariants} className="snap-center shrink-0">
                        {/* ENHANCED CARD UI */}
                        <div
                          onClick={() => router.push(`/god/${item.slug}`)}
                          className="group relative w-[220px] lg:w-auto h-[340px] lg:h-[380px] rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border bg-card"
                        >
                          {/* Image Layer */}
                          <div className="absolute inset-0 z-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-stxt">
                                No Image
                              </div>
                            )}
                            {/* Gradient Overlay for Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          </div>

                          {/* Top Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                {item.type}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Content */}
                          <div className="absolute bottom-0 left-0 w-full p-5 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="font-serif font-bold text-2xl text-white leading-tight mb-2 drop-shadow-md line-clamp-2">
                              {formatText(item.name)}
                            </h3>

                            {/* Hover Reveal Action */}
                            <div className="overflow-hidden h-0 group-hover:h-8 transition-all duration-300 opacity-0 group-hover:opacity-100">
                              <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                                <span>Discover</span>
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {/* Subtle Border Glow on Hover */}
                          <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-[24px] transition-colors duration-500 pointer-events-none z-20" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full w-full py-12 text-center text-stxt italic bg-card rounded-[2rem] border border-border/50">
                      Continue exploring to get better recommendations.
                    </div>
                  )}
                </motion.div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
