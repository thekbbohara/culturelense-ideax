"use client";

import React from "react";
import { Search, Loader2, X } from "lucide-react";
import { searchEntities, type SearchResult } from "@/actions/search";
import { saveSearchEntry } from "@/actions/history";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { AnimatePresence, motion } from "framer-motion";

export function NavSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length >= 2) {
        setIsLoading(true);
        const data = await searchEntities(debouncedQuery);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };
    search();
  }, [debouncedQuery]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (slug: string, name: string) => {
    setIsFocused(false);
    setQuery("");
    // Create new navigation first for better UX
    router.push(`/god/${slug}`);
    
    // Save history in background
    await saveSearchEntry(name);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
       <div className={`relative flex items-center bg-neutral-black/5 rounded-full px-4 py-2 transition-all border ${isFocused ? 'bg-white border-primary shadow-lg ring-4 ring-primary/5' : 'border-neutral-black/20 hover:border-neutral-black/40 hover:bg-neutral-black/10'}`}>
          <Search className={`w-4 h-4 mr-3 ${isFocused ? 'text-primary' : 'text-neutral-black/40'}`} />
          <input 
            type="text"
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-black/40 font-medium"
            placeholder="Search details..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {isLoading ? (
             <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
          ) : query.length > 0 ? (
             <button onClick={() => setQuery("")} className="ml-2 hover:bg-neutral-black/10 rounded-full p-0.5">
                <X className="w-3 h-3 text-neutral-black/40" />
             </button>
          ) : null}
       </div>

       {/* Dropdown Results */}
       <AnimatePresence>
         {isFocused && (query.length >= 2 || results.length > 0) && (
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-neutral-black/5 overflow-hidden z-50 py-2"
            >
                {results.length > 0 ? (
                    results.map((result) => (
                        <div 
                            key={result.id}
                            onClick={() => handleSelect(result.slug, result.name)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-black/5 cursor-pointer transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-neutral-black/5 relative overflow-hidden shrink-0">
                                {result.imageUrl && <Image src={result.imageUrl} alt={result.name} fill className="object-cover" />}
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-sm text-neutral-black">{result.name}</h4>
                                <p className="text-[10px] uppercase font-bold text-neutral-black/40">{result.type}</p>
                            </div>
                        </div>
                    ))
                ) : !isLoading && query.length >= 2 ? (
                    <div className="px-4 py-3 text-center text-sm text-neutral-black/40">
                        No results found.
                    </div>
                ) : null}
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
