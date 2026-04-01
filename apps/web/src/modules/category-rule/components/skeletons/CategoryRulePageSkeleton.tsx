import { CommonHeader } from "@/components/header/CommonHeader";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryRulePageSkeleton() {
  return (
    <div className="app-page-regular flex h-full flex-col overflow-y-auto px-4 py-4 pb-[calc(var(--bottom-nav-total-h))] lg:px-8 xl:px-10">
      <CommonHeader title="Category Rules" />
      <div className="space-y-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="bg-card border-input/30 flex items-center justify-between rounded-xl border px-4 py-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-md" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="size-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
