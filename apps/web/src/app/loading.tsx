import { Skeleton } from "@/components/ui-components";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-8">
      <Skeleton className="h-12 w-48 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-64 rounded-md" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>
    </div>
  );
}
