"use client";

import React from "react";
import { Card, Skeleton } from "@/components/ui-components";
import { Scan, Sparkles, ArrowRight, Search } from "lucide-react";
import { checkUserHistory } from "@/actions/home";
import { getRecentSearchedEntities } from "@/actions/history";
import { getRelatedEntities } from "@/actions/entities";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function HomePage() {
    const [hasHistory, setHasHistory] = React.useState<boolean | null>(null);
    const [recentEntities, setRecentEntities] = React.useState<any[]>([]);
    const [recommendedEntities, setRecommendedEntities] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        const init = async () => {
            const { hasHistory } = await checkUserHistory();
            setHasHistory(hasHistory);

            if (hasHistory) {
                setIsLoading(true);
                const { data } = await getRecentSearchedEntities();
                setRecentEntities(data || []);

                if (data && data.length > 0 && data[0]) {
                    const related = await getRelatedEntities(data[0].id);
                    setRecommendedEntities(related);
                }

                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // 1. IMPROVED INITIAL LOADING STATE (App Launch)
    // This mimics the "Scan" view structure to minimize layout shift for new users
    if (hasHistory === null) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
                {/* Abstract Ambient Background */}
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
            <main className="pb-32 min-h-screen flex flex-col w-full overflow-x-hidden">
                {!hasHistory ? (
                    // EMPTY STATE: Immersive Scan (Desktop Optimized)
                    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6">
                        {/* Ambient Background Elements */}
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

                        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center">
                            {/* Text Content */}
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
                                        Point your camera at art, statues, or symbols to instantly identify deities and uncover their stories.
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

                            {/* Interactive Scanner Visual */}
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 sm:inset-8 lg:-inset-4 border border-border/30 rounded-[2rem] sm:rounded-[3rem] pointer-events-none z-0">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl" />
                                </div>

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
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="mt-8 text-center lg:hidden">
                                        <h2 className="text-2xl font-serif font-black italic mb-2 text-txt">Tap to Scan</h2>
                                        <p className="text-stxt">Point at art to identify</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // POPULATED STATE
                    <div className="space-y-20 px-6 max-w-7xl mx-auto mt-8 lg:mt-12 w-full">

                        {/* Featured Section - Bento Grid Layout */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary/10 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-secondary" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-serif font-black italic text-txt">Featured Today</h2>
                                </div>
                            </div>

                            {/* 2. IMPROVED DASHBOARD SKELETON (Matches Grid-Cols-12 perfectly) */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-fr">
                                    {/* Main Feature Skeleton */}
                                    <div className="col-span-1 md:col-span-2 lg:col-span-8 h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden bg-card border border-border relative">
                                        <Skeleton className="w-full h-full absolute inset-0" />
                                        <div className="absolute bottom-0 left-0 p-8 w-full space-y-4 z-10">
                                            <Skeleton className="w-24 h-6 rounded-full bg-background/50" />
                                            <Skeleton className="w-3/4 h-12 rounded-xl bg-background/50" />
                                        </div>
                                    </div>
                                    {/* Side Stack Skeletons */}
                                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col gap-6 h-[400px] lg:h-[500px]">
                                        <div className="flex-1 rounded-[2rem] bg-card border border-border overflow-hidden relative">
                                            <Skeleton className="w-full h-full" />
                                        </div>
                                        <div className="flex-1 rounded-[2rem] bg-card border border-border overflow-hidden relative">
                                            <Skeleton className="w-full h-full" />
                                        </div>
                                    </div>
                                </div>
                            ) : recentEntities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-fr">
                                    {/* Primary Featured Item */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => router.push(`/god/${recentEntities[0].slug}`)}
                                        className="col-span-1 md:col-span-2 lg:col-span-8 relative h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                                    >
                                        {recentEntities[0].imageUrl ? (
                                            <Image
                                                src={recentEntities[0].imageUrl}
                                                alt={recentEntities[0].name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center text-stxt">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-8 w-full">
                                            <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 inline-block">
                                                {recentEntities[0].type}
                                            </span>
                                            <h3 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-2">{recentEntities[0].name}</h3>
                                            <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                                                <span className="text-sm font-medium">View Details</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Secondary Featured Items */}
                                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col gap-6 h-[400px] lg:h-[500px]">
                                        {recentEntities.slice(1, 3).map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => router.push(`/god/${item.slug}`)}
                                                className="flex-1 relative rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-lg transition-all"
                                            >
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center text-stxt">No Image</div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <h3 className="font-serif font-bold text-xl text-white truncate">{item.name}</h3>
                                                    <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">{item.type}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {recentEntities.length < 2 && (
                                            <div className="flex-1 rounded-[2rem] bg-accent/10 border border-dashed border-border flex flex-col items-center justify-center text-center p-6 text-stxt">
                                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                                <p>Search more to fill your gallery</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-card rounded-[2rem] border border-dashed border-border text-stxt font-medium">
                                    Search for a deity to see it featured here.
                                </div>
                            )}
                        </section>

                        {/* Recommended Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-2 h-8 rounded-full bg-primary" />
                                <h2 className="text-2xl lg:text-3xl font-serif font-black italic text-txt">Recommended for You</h2>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <Card key={i} className="p-4 rounded-[2rem] bg-card border border-border h-full shadow-none">
                                            <Skeleton className="aspect-square rounded-2xl mb-4 bg-muted" />
                                            <div className="space-y-3">
                                                <Skeleton className="h-3 w-1/3 rounded-full bg-muted" />
                                                <Skeleton className="h-5 w-3/4 rounded-md bg-muted" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6"
                                >
                                    {recommendedEntities.length > 0 ? recommendedEntities.map((item, i) => (
                                        <motion.div key={i} variants={itemVariants}>
                                            <Card
                                                onClick={() => router.push(`/god/${item.slug}`)}
                                                className="group h-full p-3 lg:p-4 rounded-[2rem] bg-card border border-border hover:border-secondary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-secondary/10 cursor-pointer"
                                            >
                                                <div className="aspect-square relative rounded-2xl overflow-hidden mb-4 bg-muted">
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-stxt">No Image</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/90 p-2 rounded-full backdrop-blur-sm">
                                                            <ArrowRight className="w-4 h-4 text-black" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-1 pb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-1.5">{item.type}</span>
                                                    <h3 className="font-serif font-bold text-lg text-txt leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )) : (
                                        <div className="col-span-full py-12 text-center text-stxt italic bg-card rounded-[2rem] border border-border/50">
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