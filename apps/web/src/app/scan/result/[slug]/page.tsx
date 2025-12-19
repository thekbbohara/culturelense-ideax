import { getEntityBySlug, getEntitiesBySlugs } from '@/actions/entities';
import { Button } from '@culturelense/ui';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';

// Color Palette Definition (re-used for inline styles where Tailwind classes aren't set)
const palette = {
  primary: '#B32624', // Crimson
  secondary: '#DAA520', // Gold
  tertiary: '#E2725B', // Terracotta
  bg: '#1A1A1A', // Black
  text: '#FDFBF7', // Off-white
  surface: '#262626', // Slightly lighter black
};

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { confidence: string; data?: string };
}) {
  const result = await getEntityBySlug(params.slug);
  const entity = result.data;

  // Parse Debug Data & Top 3
  const debugData = searchParams.data ? JSON.parse(searchParams.data) : null;
  const top3Raw = debugData?.top_3 || [];

  const suggestionSlugs = top3Raw
    .map((item: any) => item.god.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter((s: string) => s !== params.slug.toLowerCase());

  // Fetch suggestion details
  const suggestionsResult = await getEntitiesBySlugs(suggestionSlugs);
  const suggestions = suggestionsResult.data;

  // 404 State - Minimalist
  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A] text-[#FDFBF7] p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-serif text-[#DAA520]">Artifact Not Found</h1>
          <p className="text-white/60">We couldn't retrieve the details for this entity.</p>
          <Link href="/scan">
            <Button className="rounded-full px-8 py-6 bg-white text-black hover:bg-[#DAA520] transition-colors duration-500">
              Return to Scanner
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FDFBF7] font-sans selection:bg-[#DAA520] selection:text-black">
      
      {/* Floating Navigation (Mobile & Desktop) */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <Link href="/scan" className="pointer-events-auto">
          <button className="group flex items-center gap-3 pr-4 py-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 transition-all hover:bg-[#B32624] hover:border-[#B32624]">
            <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium tracking-wide">BACK</span>
          </button>
        </Link>
        
        <button className="pointer-events-auto p-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 transition-all hover:bg-white hover:text-black">
          <Share2 className="w-5 h-5" />
        </button>
      </nav>

      <main className="lg:flex min-h-screen">
        
        {/* LEFT COLUMN: Visual Hero (Sticky on Desktop) */}
        <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[#262626]">
            {entity.imageUrl ? (
              <img 
                src={entity.imageUrl} 
                alt={entity.name} 
                className="w-full h-full object-cover opacity-90 scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#262626]">
                <span className="text-9xl font-serif text-white/5">{entity.name[0]}</span>
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#1A1A1A]" />
          
          {/* Mobile Title Overlay (Hidden on Desktop) */}
          <div className="absolute bottom-0 left-0 p-8 lg:hidden w-full z-10">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-[0.2em] uppercase text-[#DAA520] border border-[#DAA520]/30 rounded-full bg-black/40 backdrop-blur-sm">
              {entity.type}
            </span>
            <h1 className="text-5xl font-serif font-medium leading-tight text-white mb-2">
              {entity.name}
            </h1>
            <div className="h-1 w-20 bg-[#B32624] mt-4 rounded-full" />
          </div>
        </div>

        {/* RIGHT COLUMN: Content Scroll */}
        <div className="relative w-full lg:w-1/2 px-6 py-12 lg:px-20 lg:py-24 bg-[#1A1A1A]">
          
          {/* Desktop Title (Hidden on Mobile) */}
          <div className="hidden lg:block mb-16">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-[0.2em] uppercase text-[#DAA520] border border-[#DAA520]/30 rounded-full">
              {entity.type}
            </span>
            <h1 className="text-6xl xl:text-7xl font-serif font-medium leading-tight text-white mb-6">
              {entity.name}
            </h1>
            {entity.nickName && (
               <p className="text-xl text-white/40 font-serif italic">" {entity.nickName} "</p>
            )}
          </div>

          <div className="space-y-16">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pb-8 border-b border-white/5">
              {entity.location && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-xs uppercase tracking-wider text-white/40 mb-1">Location</span>
                  <span className="text-lg font-medium">{entity.location}</span>
                </div>
              )}
              {entity.religion && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-xs uppercase tracking-wider text-white/40 mb-1">Origin</span>
                  <span className="text-lg font-medium">{entity.religion}</span>
                </div>
              )}
            </div>

            {/* Overview - "The Curator's Note" Style */}
            <div className="relative">
              <p className="text-lg lg:text-xl leading-relaxed text-[#FDFBF7]/90 font-light">
                {entity.intro || entity.description}
              </p>
            </div>

            {/* Fun Fact Feature */}
            {entity.funFact && (
              <div className="relative p-8 lg:p-10 rounded-2xl overflow-hidden group">
                {/* Golden Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#DAA520]/10 to-transparent border border-[#DAA520]/20 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-[#DAA520]"></span>
                    <span className="text-[#DAA520] text-xs font-bold uppercase tracking-widest">Did You Know?</span>
                  </div>
                  <p className="text-xl lg:text-2xl font-serif text-[#DAA520] italic leading-relaxed">
                    "{entity.funFact}"
                  </p>
                </div>
              </div>
            )}

            {/* Narrative Sections */}
            <div className="space-y-12">
              {entity.journey && (
                <section>
                  <h3 className="text-2xl font-serif text-white mb-4">The Journey</h3>
                  <div className="pl-6 border-l-2 border-[#B32624]/50">
                    <p className="text-white/70 leading-relaxed">{entity.journey}</p>
                  </div>
                </section>
              )}

              {(entity.myth || entity.history) && (
                <section>
                  <h3 className="text-2xl font-serif text-white mb-4">Mythology & History</h3>
                  <div className="p-6 rounded-2xl bg-[#262626]/50 border border-white/5">
                    {entity.myth && <p className="text-white/70 leading-relaxed mb-6">{entity.myth}</p>}
                    {entity.history && (
                       <p className="text-sm text-white/50 pt-6 border-t border-white/5 font-mono">
                         HISTORICAL CONTEXT: {entity.history}
                       </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Suggestions - Gallery Style */}
            {suggestions.length > 0 && (
              <div className="pt-12 border-t border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">
                  Related Artifacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {suggestions.map((sug) => (
                    <Link href={`/scan/result/${sug.slug}`} key={sug.id} className="group block">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-[#262626]">
                        {sug.imageUrl && (
                          <img 
                            src={sug.imageUrl} 
                            alt={sug.name} 
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-80" 
                          />
                        )}
                        <div className="absolute bottom-4 left-4">
                            <span className="px-2 py-1 bg-black/60 text-[10px] text-white uppercase tracking-wider backdrop-blur-md rounded">
                                {sug.type}
                            </span>
                        </div>
                      </div>
                      <h4 className="text-lg font-medium text-white group-hover:text-[#DAA520] transition-colors">
                        {sug.name}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer Space */}
            <div className="h-20" />
            
          </div>
        </div>
      </main>
    </div>
  );
}