export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-[#1e293b] animate-pulse rounded-xl ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <SkeletonBlock className="col-span-3 h-64" />
        <SkeletonBlock className="col-span-6 h-64" />
        <SkeletonBlock className="col-span-3 h-64" />
      </div>
      <SkeletonBlock className="h-48" />
      <div className="grid grid-cols-3 gap-6">
        <SkeletonBlock className="h-56" />
        <SkeletonBlock className="h-56" />
        <SkeletonBlock className="h-56" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="col-span-2 h-44" />
      </div>
    </div>
  );
}
