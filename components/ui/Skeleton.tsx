interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-3.5 w-28 rounded-full" />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <div className="border-t border-white/8 px-5 py-3">
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonOrderRow() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      </div>
      <div className="border-t border-white/8 px-5 py-3">
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
    </div>
  );
}
