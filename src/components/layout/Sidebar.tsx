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
  Brain,
  Newspaper,
  BookOpen,
  ChevronDown,
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const modules = [
  { name: "Project Tracker", href: "/dashboard/projects", icon: Target },
  { name: "Cost Estimator", href: "/dashboard/cost", icon: Calculator },
  { name: "Safety Hub", href: "/dashboard/safety", icon: ShieldAlert },
  { name: "Document Analyzer", href: "/dashboard/docs", icon: FileText },
  { name: "Procurement", href: "/dashboard/procurement", icon: ShoppingCart },
  { name: "Workforce", href: "/dashboard/workforce", icon: Users },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Progress Vision", href: "/dashboard/progress", icon: Activity },
  { name: "Tender Analyzer", href: "/dashboard/tender", icon: Search },
];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(true);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 z-[100]",
        "bg-slate-900 border-r border-slate-800",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("p-5 flex items-center justify-between border-b border-slate-800", isCollapsed && "px-4")}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/20">
            C
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">CONSTAI</h1>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Platform</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white",
            isCollapsed && "mx-auto mt-4"
          )}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {/* Dashboard */}
        <div className="px-3 mb-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              isActive("/dashboard") && pathname === "/dashboard"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            )}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Intelligence Hub</span>}
          </Link>
        </div>

        {/* Modules Section */}
        <div className="px-3 mt-4 mb-1">
          <button
            onClick={() => setModulesOpen(!modulesOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            {!isCollapsed && <span>Modules</span>}
            {!isCollapsed && (
              <ChevronDown className={cn("w-3 h-3 transition-transform", modulesOpen && "rotate-180")} />
            )}
          </button>
        </div>

        {modulesOpen && (
          <div className="space-y-0.5 px-3">
            {modules.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : ""}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    active
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-400" : "text-slate-500 group-hover:text-white")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        )}

        {/* Content Section */}
        <div className="px-3 mt-6 mb-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Content</span>
          )}
        </div>
        <div className="space-y-0.5 px-3">
          <Link
            to="/dashboard/blog"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive("/dashboard/blog")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            )}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white" />
            {!isCollapsed && <span>Blog</span>}
          </Link>
          <Link
            to="/dashboard/news"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive("/dashboard/news")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            )}
          >
            <Newspaper className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white" />
            {!isCollapsed && <span>News</span>}
          </Link>
        </div>

        {/* Admin */}
        <div className="px-3 mt-6 mb-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin</span>
          )}
        </div>
        <div className="space-y-0.5 px-3">
          <Link
            to="/dashboard/ml-admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive("/dashboard/ml-admin")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            )}
          >
            <Brain className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white" />
            {!isCollapsed && <span>ML Admin</span>}
          </Link>
          <Link
            to="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive("/dashboard/settings")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            )}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-white" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          {!isCollapsed && (
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
          )}
        </div>
      </div>
    </aside>
  );
}
