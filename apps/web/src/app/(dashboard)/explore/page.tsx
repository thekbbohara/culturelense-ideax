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
    <div className="h-screen flex flex-col px-4 md:px-6 gap-4 overflow-hidden">
      <div className="flex-1 min-h-0 pb-6">
        <div className="">
          Places you have been to:
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Map />
        </HydrationBoundary>
      </div>
    </div>
  );
}

