import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard,
  Target, 
  Calculator, 
  ShieldAlert, 
  ChevronLeft,
  Menu,
  FileText,
  ShoppingCart,
  Users,
  Wrench,
  Activity,
  Search,
  Settings,
  Brain
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const groups = [
  {
    name: "Navigation",
    items: [
      { name: "Intelligence Hub", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    name: "Modules",
    items: [
      { name: "Project Tracker", href: "/dashboard/projects", icon: Target },
      { name: "Cost Estimator", href: "/dashboard/cost", icon: Calculator },
      { name: "Safety Hub", href: "/dashboard/safety", icon: ShieldAlert },
      { name: "Document Analyzer", href: "/dashboard/docs", icon: FileText },
      { name: "Procurement", href: "/dashboard/procurement", icon: ShoppingCart },
      { name: "Workforce", href: "/dashboard/workforce", icon: Users },
      { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
      { name: "Progress Vision", href: "/dashboard/progress", icon: Activity },
      { name: "Tender Analyzer", href: "/dashboard/tender", icon: Search },
      { name: "ML Admin", href: "/dashboard/ml-admin", icon: Brain },
      { name: "Integration", href: "/dashboard/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "border-r border-border bg-white h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 z-[100]",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6 flex items-center justify-between", isCollapsed && "px-4")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-black text-primary-foreground text-lg shadow-sm">
              C
            </div>
            <h1 className="text-sm font-black text-foreground tracking-tight">
              CONSTRUCTION AI
            </h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-sm mx-auto">
            C
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground",
            isCollapsed && "mt-4 mx-auto"
          )}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {groups.map((group) => (
          <div key={group.name} className="mb-6">
            {!isCollapsed && (
              <h2 className="px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3">
                {group.name}
              </h2>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isComingSoon = item.href.includes('/dashboard/') && !['/dashboard/projects', '/dashboard/ml-admin'].includes(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={cn(
                      "flex items-center justify-between px-6 py-3 text-sm font-bold transition-all relative group",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" />
                      )}
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && isComingSoon && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-tighter">
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className={cn("p-4 mt-auto border-t border-border flex items-center justify-center", isCollapsed && "px-2")}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!isCollapsed && <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Construct_v4</span>}
        </div>
      </div>
    </aside>
  );
}
