import { getExploreData } from "@/actions/map";
import dynamic from "next/dynamic";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

const Map = dynamic(() => import("@/components/explore/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/20 border border-border rounded-lg">
      <p className="text-muted-foreground animate-pulse">Loading Map...</p>
    </div>
  ),
});

export default async function ExplorePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['explore-data'],
    queryFn: getExploreData,
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="px-6 flex items-center gap-3 py-3">
        <div className="w-2 h-8 rounded-full bg-secondary" />
        <h2 className="text-2xl lg:text-3xl font-serif font-black italic text-txt">
          Places you have been to:
        </h2>
      </div>
      <div className="flex-1 min-h-0 relative pb-20">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Map />
        </HydrationBoundary>
      </div>
    </div>
  );
}

