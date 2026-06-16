import { motion } from "framer-motion";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-4 animate-pulse p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded-xl" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Something went wrong</h3>
      <p className="text-sm text-slate-500 font-medium max-w-xs">{message || "An unexpected error occurred."}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title || "Nothing here yet"}</h3>
      <p className="text-sm text-slate-500 font-medium max-w-xs">{description || "No data available."}</p>
    </div>
  );
}
