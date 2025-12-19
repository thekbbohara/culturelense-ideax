import React from "react";
import { Button, Card, Badge } from "@/components/ui-components";
import Link from "next/link";
import { ArrowLeft, MapPin, BookOpen, Quote, Sparkles } from "lucide-react";
import { getGodBySlug } from "@/actions/god";
import Image from "next/image";

export default async function GodDetailsPage({ params }: { params: { slug: string } }) {
  const god = await getGodBySlug(params.slug);

  if (!god) {
    return (
      <div className="min-h-screen bg-neutral-white p-6 flex flex-col items-center justify-center text-center">
         <h1 className="text-4xl font-serif font-black italic mb-4">404</h1>
         <p className="text-neutral-black/60 mb-8">Deity not found in our archives.</p>
         <Link href="/home">
            <Button variant="outline" className="rounded-full">Back to Home</Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-white pb-20">
      {/* Hero Header with Image */}
      <div className="relative h-[50vh] w-full bg-neutral-black/90 overflow-hidden">
        {god.imageUrl && (
             <Image 
                src={god.imageUrl} 
                alt={god.name} 
                fill 
                className="object-cover opacity-60"
                priority
             />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-white via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
            <Link href="/home">
                <Button variant="ghost" className="rounded-full gap-2 text-white hover:text-white/80 hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Button>
            </Link>
        </div>

        <div className="absolute bottom-0 w-full px-6 pb-12 max-w-7xl mx-auto">
             <Badge className="bg-secondary text-neutral-black hover:bg-secondary mb-4 uppercase tracking-widest">{god.type}</Badge>
             <h1 className="text-6xl font-serif font-black italic text-neutral-black mb-2">{god.name}</h1>
             {god.location && (
                <div className="flex items-center gap-2 text-neutral-black/60 font-medium">
                    <MapPin className="w-4 h-4" />
                    <span>{god.location}</span>
                </div>
             )}
        </div>
      </div>

      <main className="px-6 max-w-7xl mx-auto -mt-8 relative z-10 space-y-12">
        {/* Intro Section */}
        <section className="bg-white p-8 rounded-[2rem] border border-neutral-black/5 shadow-xl shadow-neutral-black/5">
             <p className="text-2xl font-serif leading-relaxed text-neutral-black/80">
                {god.description}
             </p>
             {god.intro && <p className="mt-4 text-neutral-black/60 leading-relaxed">{god.intro}</p>}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Legend/Myth */}
            {god.myth && (
                <Card className="p-8 rounded-[2rem] bg-tertiary/5 border-tertiary/10">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-tertiary" />
                        <h2 className="text-2xl font-serif font-bold text-tertiary">Mythological Journey</h2>
                    </div>
                    <p className="text-neutral-black/70 leading-relaxed max-h-[300px] overflow-y-auto pr-4">
                        {god.myth}
                    </p>
                </Card>
            )}

            {/* Fun Fact & Journey */}
            <div className="space-y-8">
                {god.funFact && (
                    <Card className="p-8 rounded-[2rem] bg-secondary/10 border-secondary/20 relative overflow-hidden">
                        <Quote className="absolute top-4 right-4 w-24 h-24 text-secondary/10 rotate-12" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            <h3 className="font-bold uppercase tracking-widest text-secondary text-sm">Did you know?</h3>
                        </div>
                        <p className="text-xl font-serif italic text-neutral-black/80 relative z-10">
                            &quot;{god.funFact}&quot;
                        </p>
                    </Card>
                )}
                
                {god.religion && (
                    <div className="p-6 rounded-2xl border border-neutral-black/10 flex items-center justify-between">
                        <span className="text-neutral-black/40 font-bold uppercase tracking-widest text-sm">Religion</span>
                        <span className="font-serif font-bold text-lg">{god.religion}</span>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
