export default function AdminLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse bg-slate-50/50">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-100 rounded w-64"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded-md w-32"></div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-100 rounded w-24"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
            <div className="h-3 bg-slate-100 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Table Content Skeleton */}
      <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="h-6 bg-slate-200 rounded w-36"></div>
          <div className="h-8 bg-slate-100 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-50 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-slate-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
