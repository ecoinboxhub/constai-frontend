import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, Bell, Settings, Search, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [isOnlineManual, setIsOnlineManual] = useState(true);

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, i) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: "/" + paths.slice(0, i + 1).join("/"),
    }));
  };

  const breadcrumbs = getBreadcrumbs();

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

  const isApiOnline = health?.status === "ok";
  const status = isOnlineManual && isApiOnline ? "online" : "offline";

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <span className={i === breadcrumbs.length - 1 ? "text-foreground font-black" : ""}>
                {crumb.name}
              </span>
              {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm hidden md:block group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-3 py-2 rounded-full bg-secondary/50 border border-transparent text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium text-foreground"
             placeholder="Search site logs..."
           />
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-end">
        {/* System Status Toggle */}
        <button 
          onClick={() => setIsOnlineManual(!isOnlineManual)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${status === 'online' ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
          <span className="text-[10px] font-black text-foreground uppercase tracking-wider">
            SYSTEM: {status.toUpperCase()}
          </span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
            </button>
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          </div>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-border ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-foreground leading-none uppercase">Company Admin</p>
              <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">Tenant Workspace</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:bg-primary/20 transition-colors">
                <User className="w-5 h-5 text-primary" />
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login", { replace: true });
                }}
                className="text-[8px] font-black text-red-500 uppercase hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
