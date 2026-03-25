import { Skeleton } from "@/components/ui/skeleton";

export function CategoryRuleListSkeleton() {
  return (
    <div className="space-y-4 rounded-lg py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
