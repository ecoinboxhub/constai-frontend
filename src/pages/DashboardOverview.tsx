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
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  {
    id: "tracker",
    name: "Project Tracker",
    description: "Fully implemented AI-powered delay prediction and portfolio risk analytics.",
    icon: Target,
    href: "/dashboard/projects",
    status: "Active MVP",
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "cost",
    name: "Cost Estimator",
    description: "Labor-burden aware budget forecasting with Naira pricing intelligence.",
    icon: Calculator,
    href: "/dashboard/cost",
    status: "Coming Soon",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    id: "safety",
    name: "Safety Hub",
    description: "Real-time hazard detection and safety compliance monitoring for sites.",
    icon: ShieldAlert,
    href: "/dashboard/safety",
    status: "Coming Soon",
    color: "bg-amber-600",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    id: "docs",
    name: "Document Analyzer",
    description: "AI-powered clause extraction and compliance scoring for contracts.",
    icon: FileText,
    href: "/dashboard/docs",
    status: "Coming Soon",
    color: "bg-purple-600",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "procurement",
    name: "Procurement Assistant",
    description: "Supplier intelligence and materials price forecasting for Nigeria.",
    icon: ShoppingCart,
    href: "/dashboard/procurement",
    status: "Coming Soon",
    color: "bg-rose-600",
    lightColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    id: "workforce",
    name: "Workforce Scheduler",
    description: "Shift optimization and idle rate reduction analytics for laborers.",
    icon: Users,
    href: "/dashboard/workforce",
    status: "Coming Soon",
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "maintenance",
    name: "Maintenance Predictor",
    description: "Equipment risk assessment and preventive schedules using ML.",
    icon: Wrench,
    href: "/dashboard/maintenance",
    status: "Coming Soon",
    color: "bg-slate-600",
    lightColor: "bg-slate-50",
    textColor: "text-slate-600",
  },
  {
    id: "progress",
    name: "Progress Vision",
    description: "Visual completion deviation analysis and automated site monitoring.",
    icon: Activity,
    href: "/dashboard/progress",
    status: "Coming Soon",
    color: "bg-cyan-600",
    lightColor: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
  {
    id: "tender",
    name: "Tender Analyzer",
    description: "Risk phrase extraction and bid competitiveness scoring for RFPs.",
    icon: Search,
    href: "/dashboard/tender",
    status: "Coming Soon",
    color: "bg-orange-600",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    id: "settings",
    name: "Integration Suite",
    description: "Manage API keys, webhooks, and enterprise system connections.",
    icon: Settings,
    href: "/dashboard/settings",
    status: "Coming Soon",
    color: "bg-zinc-800",
    lightColor: "bg-zinc-100",
    textColor: "text-zinc-800",
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700">
      <header className="max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
            Platform Vision v1.0
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
            <Zap className="w-3 h-3 fill-emerald-600" />
            AI Core Active
          </div>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
          ConstAI <span className="text-primary">Intelligence Hub</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium mt-6 leading-relaxed">
          Nigeria's first fully integrated AI construction platform. 
          Manage risks, costs, and operations from a single predictive console.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link to={module.href} key={module.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${module.lightColor} blur-[80px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl ${module.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                    <module.icon className="w-7 h-7" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    module.status === "Active MVP" 
                      ? "bg-primary/5 border-primary/20 text-primary" 
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}>
                    {module.status}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-1">
                  {module.description}
                </p>

                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                  <span>Enter Module</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
