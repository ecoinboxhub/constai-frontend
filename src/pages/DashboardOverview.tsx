import { motion } from "framer-motion";
import {
  Target,
  Calculator,
  ShieldAlert,
  FileText,
  ShoppingCart,
  Users,
  Wrench,
  Activity,
  Search,
  Settings,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState } from "@/components/ui/States";

const modules = [
  {
    id: "tracker",
    name: "Project Tracker",
    description: "AI-powered delay prediction and portfolio risk analytics.",
    icon: Target,
    href: "/dashboard/projects",
    status: "Live",
    gradient: "from-blue-600 to-blue-700",
    lightGlow: "bg-blue-50",
  },
  {
    id: "cost",
    name: "Cost Estimator",
    description: "Labor-burden aware budget forecasting with Naira pricing.",
    icon: Calculator,
    href: "/dashboard/cost",
    status: "Live",
    gradient: "from-emerald-600 to-emerald-700",
    lightGlow: "bg-emerald-50",
  },
  {
    id: "safety",
    name: "Safety Hub",
    description: "Real-time hazard detection and safety compliance monitoring.",
    icon: ShieldAlert,
    href: "/dashboard/safety",
    status: "Live",
    gradient: "from-amber-600 to-amber-700",
    lightGlow: "bg-amber-50",
  },
  {
    id: "docs",
    name: "Document Analyzer",
    description: "AI clause extraction and compliance scoring for contracts.",
    icon: FileText,
    href: "/dashboard/docs",
    status: "Live",
    gradient: "from-purple-600 to-purple-700",
    lightGlow: "bg-purple-50",
  },
  {
    id: "procurement",
    name: "Procurement Assistant",
    description: "Supplier intelligence and materials price forecasting.",
    icon: ShoppingCart,
    href: "/dashboard/procurement",
    status: "Live",
    gradient: "from-rose-600 to-rose-700",
    lightGlow: "bg-rose-50",
  },
  {
    id: "workforce",
    name: "Workforce Scheduler",
    description: "Shift optimization and idle rate reduction analytics.",
    icon: Users,
    href: "/dashboard/workforce",
    status: "Live",
    gradient: "from-indigo-600 to-indigo-700",
    lightGlow: "bg-indigo-50",
  },
  {
    id: "maintenance",
    name: "Maintenance Predictor",
    description: "Equipment risk assessment and preventive schedules.",
    icon: Wrench,
    href: "/dashboard/maintenance",
    status: "Live",
    gradient: "from-slate-600 to-slate-700",
    lightGlow: "bg-slate-50",
  },
  {
    id: "progress",
    name: "Progress Vision",
    description: "Visual completion deviation analysis and site monitoring.",
    icon: Activity,
    href: "/dashboard/progress",
    status: "Live",
    gradient: "from-cyan-600 to-cyan-700",
    lightGlow: "bg-cyan-50",
  },
  {
    id: "tender",
    name: "Tender Analyzer",
    description: "Risk phrase extraction and bid competitiveness scoring.",
    icon: Search,
    href: "/dashboard/tender",
    status: "Live",
    gradient: "from-orange-600 to-orange-700",
    lightGlow: "bg-orange-50",
  },
];

export default function DashboardOverview() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/stats");
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const statCards = [
    { label: "Active Projects", value: stats?.active_projects ?? 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "On Schedule", value: stats?.on_schedule ?? 0, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "At Risk", value: stats?.at_risk ?? 0, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed", value: stats?.completed ?? 0, icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (isLoading) return <LoadingSkeleton lines={4} />;
  if (isError) return <ErrorState message="Failed to load dashboard stats." onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
            Nigeria's AI Construction Platform
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            AI Core Active
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Intelligence Hub
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage risks, costs, and operations from a single predictive console.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{stat.label}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <Link to={module.href} key={module.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.04 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${module.gradient} text-white shadow-lg`}>
                  <module.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    module.status === "Live"
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {module.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {module.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {module.description}
              </p>
              <div className="flex items-center gap-1 text-blue-600 font-semibold text-[11px] group-hover:gap-2 transition-all">
                <span>Open</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
