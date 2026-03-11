import { SkeletonBlock } from "@/components/shared/LoadingSkeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <SkeletonBlock className="h-20" />
      {/* Tabs */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-10 w-36" />
        ))}
      </div>
      {/* Main 2-col content */}
      <div className="grid grid-cols-3 gap-6">
        <SkeletonBlock className="col-span-2 h-96" />
        <SkeletonBlock className="h-96" />
      </div>
    </div>
  );
}
