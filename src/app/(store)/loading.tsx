export default function StoreLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white">
      <div className="flex flex-col items-center space-y-4 max-w-md w-full">
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin border-t-slate-900"></div>
          <div className="absolute font-serif text-slate-800 font-bold text-sm tracking-widest">FS</div>
        </div>
        
        {/* Text Skeleton */}
        <div className="w-full space-y-3 pt-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto"></div>
          <div className="h-3 bg-slate-50 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
