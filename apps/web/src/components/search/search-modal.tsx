"use client";

import React from "react";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui-components";
import { motion, AnimatePresence } from "framer-motion";
import { searchEntities, addToSearchHistory, type SearchResult } from "@/actions/search";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function SearchModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  // Debounce logic
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchEntities(query);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string, name: string) => {
    addToSearchHistory(name);
    setIsOpen(false);
    router.push(`/god/${slug}`);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full hover:bg-neutral-black/5"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-neutral-white/95 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
                <span className="font-serif text-xl font-bold italic text-primary">Search Database</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-neutral-black/5"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <div className="max-w-2xl w-full mx-auto space-y-8">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search for Gods, Sculptures..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-neutral-black/10 text-3xl font-serif font-black italic placeholder:text-neutral-black/20 focus:outline-none focus:border-primary py-4"
                    />
                    {isLoading && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    {results.map((result) => (
                        <motion.div 
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-black/5 cursor-pointer transition-colors group"
                            onClick={() => handleSelect(result.slug, result.name)}
                        >
                            <div className="w-12 h-12 rounded-full bg-neutral-black/5 relative overflow-hidden shrink-0">
                                {result.imageUrl ? (
                                    <Image src={result.imageUrl} alt={result.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-black/20">
                                        <Search className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-serif font-bold text-lg">{result.name}</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-black/40">{result.type}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-black/20 group-hover:text-primary transition-colors" />
                        </motion.div>
                    ))}
                    {query.length >= 2 && results.length === 0 && !isLoading && (
                        <p className="text-center text-neutral-black/40 py-8">No results found.</p>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
