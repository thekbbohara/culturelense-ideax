import React from 'react';
import Image from 'next/image';
import { getEntityBySlug } from '@/actions/entities';
import { getListingsByEntityId } from '@/actions/marketplace';
import { Button, Badge, Card, Separator } from '@/components/ui-components';
import { ArrowLeft, Share2, Heart, Sparkles, MapPin, ScrollText, History } from 'lucide-react';
import Link from 'next/link';
import { AnimatedButton } from '@/components/animated-button';
import { RecordVisit } from '@/components/history/RecordVisit';

export default async function GodPage({ params }: { params: { slug: string } }) {
    const { data: entity } = await getEntityBySlug(params.slug);

    if (!entity) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Entity Not Found</h1>
                    <Link href="/"><Button>Return Home</Button></Link>
                </div>
            </div>
        );
    }

    const { data: listings } = await getListingsByEntityId(entity.id);

    return (
        <div className="min-h-screen bg-background pb-20">
            <RecordVisit entityName={entity.name} />
            {/* Hero Section */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                {entity.imageUrl ? (
                    <Image
                        src={entity.imageUrl}
                        alt={entity.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 ">
                    <AnimatedButton href='/' icon={<ArrowLeft />} direction='left' />
                    {/* <AnimatedButton icon={<Share2 />} direction='right' /> */}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-primary/90 hover:bg-primary text-white border-none uppercase tracking-widest text-[10px] py-1 px-3">
                                {entity.type}
                            </Badge>
                            {entity.religion && (
                                <Badge className="bg-secondary backdrop-blur-sm text-white border-white/20 uppercase tracking-widest text-[10px] py-1 px-3">
                                    {entity.religion}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-500 italic mb-4 drop-shadow-2xl">
                            {entity.name}
                        </h1>
                        {entity.nickName && (
                            <p className="text-xl text-zinc-500 font-medium mb-6 italic">
                                "{entity.nickName}"
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
                    <div className="space-y-10">
                        {/* Intro */}
                        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-3xl border border-border/50">
                            <p className="text-lg leading-relaxed text-muted-foreground font-serif">
                                {entity.description}
                            </p>
                            {entity.intro && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-base text-foreground/80 leading-relaxed">
                                        {entity.intro}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        {(entity.myth || entity.history) && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    <h2 className="text-2xl font-serif font-black italic">Mythology & History</h2>
                                </div>
                                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                    {entity.myth && <p>{entity.myth}</p>}
                                    {entity.history && <p className="mt-4">{entity.history}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Quick Facts */}
                        <Card className="p-6 rounded-3xl bg-card border-none shadow-sm space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Quick Details</h3>

                            {entity.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase text-muted-foreground">Location</span>
                                        <span className="text-sm font-medium">{entity.location}</span>
                                    </div>
                                </div>
                            )}

                            {entity.funFact && (
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase text-muted-foreground">Did You Know?</span>
                                        <span className="text-sm font-medium italic">"{entity.funFact}"</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <Separator className="my-16" />

                {/* Product Lists / Marketplace */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <h2 className="text-2xl font-serif font-black italic">Related Artifacts used in Pooja</h2>
                        </div>
                    </div>

                    {listings && listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((item, i) => (
                                <Card
                                    key={i}
                                    className="group cursor-pointer overflow-hidden rounded-[2rem] border-none bg-card shadow-sm hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                                        {/* Price removed as per previous instruction, can re-enable if needed */}
                                        {/* 
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg">{item.price}</span> 
                                </div>
                                */}
                                        <Button className="w-full rounded-full" variant="outline">View Details</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-[3rem] border border-dashed border-border">
                            <p className="text-muted-foreground font-serif italic">No artifacts available for this entity yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
