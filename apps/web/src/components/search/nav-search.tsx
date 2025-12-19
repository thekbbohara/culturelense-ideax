"use client";

import React from "react";
import { Search, Loader2, X, ChevronRight } from "lucide-react";
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
    router.push(`/god/${slug}`);
    await saveSearchEntry(name);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md z-50">
      <motion.div
        animate={isFocused ? "focused" : "idle"}
        variants={{
          idle: {
            scale: 1,
            backgroundColor: "rgb(var(--muted))", // Using CSS variable for muted bg
            borderColor: "transparent"
          },
          focused: {
            scale: 1.02,
            backgroundColor: "rgb(var(--card))", // Using CSS variable for card bg
            borderColor: "rgb(var(--primary) / 0.5)",
            boxShadow: "0 4px 20px -2px rgb(var(--primary) / 0.1)"
          }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex items-center rounded-full px-4 py-2.5 transition-colors border"
      >
        <Search className={`w-4 h-4 mr-3 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-stxt'}`} />

        <input
          type="text"
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-stxt/70 text-txt font-medium"
          placeholder="Search details..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
            </motion.div>
          ) : query.length > 0 ? (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setQuery("")}
              className="ml-2 hover:bg-destructive/10 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3 text-stxt hover:text-destructive transition-colors" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isFocused && (query.length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-3 left-0 w-full bg-card/70 backdrop-blur-xl rounded-[1.5rem] shadow-2xl shadow-black/5 border-2 border-border overflow-hidden py-2"
          >
            {results.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                {results.map((result, i) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelect(result.slug, result.name)}
                    className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/10 cursor-pointer transition-all border-b border-border/40 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted relative overflow-hidden shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                      {result.imageUrl ? (
                        <Image src={result.imageUrl} alt={result.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary font-bold text-xs">
                          {result.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-sm text-txt group-hover:text-primary transition-colors">{result.name}</h4>
                      <p className="text-[10px] uppercase font-bold text-stxt tracking-wider">{result.type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stxt/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </motion.div>
                ))}
              </div>
            ) : !isLoading && query.length >= 2 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center text-stxt">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm font-medium">No deities found</span>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}