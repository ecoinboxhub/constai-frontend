import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      try {
        const res = await api.get("/health");
        return res.data;
      } catch {
        return { status: "offline" };
      }
    },
    refetchInterval: 10000,
  });

  const isOnline = health?.status === "ok" || health?.status === "operational";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Page title area */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? "text-green-600" : "text-red-500"}`}>
            {isOnline ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white transition-all font-medium"
            placeholder="Search projects, documents..."
          />
        </div>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800">Company Admin</p>
            <p className="text-[10px] font-medium text-slate-400">Enterprise Workspace</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
