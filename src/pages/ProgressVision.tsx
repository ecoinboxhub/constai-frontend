import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui/States";

interface Project {
  id: number;
  name: string;
  completion_percentage: number;
  project_status: string;
  risk_level: string;
  location: string;
  budget_allocated: number;
  budget_spent: number | null;
  expected_end_date: string;
  delay_status: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 1, name: "Eko Atlantic Phase II", completion_percentage: 68, project_status: "Active", risk_level: "Low", location: "Victoria Island, Lagos", budget_allocated: 4200000000, budget_spent: 2800000000, expected_end_date: "2026-09-15", delay_status: "On Schedule" },
  { id: 2, name: "Lekki Deep Sea Port Storage", completion_percentage: 45, project_status: "Active", risk_level: "Medium", location: "Ibeju-Lekki, Lagos", budget_allocated: 1800000000, budget_spent: 900000000, expected_end_date: "2026-12-01", delay_status: "Delayed" },
  { id: 3, name: "Abuja Tech Hub Site B", completion_percentage: 92, project_status: "Active", risk_level: "Low", location: "Maitama, Abuja", budget_allocated: 850000000, budget_spent: 780000000, expected_end_date: "2026-04-30", delay_status: "On Schedule" },
  { id: 4, name: "Port Harcourt Bridge Approach", completion_percentage: 23, project_status: "Active", risk_level: "High", location: "Port Harcourt, Rivers", budget_allocated: 3200000000, budget_spent: 450000000, expected_end_date: "2027-03-01", delay_status: "Delayed" },
  { id: 5, name: "Kano Industrial Park", completion_percentage: 61, project_status: "Active", risk_level: "Medium", location: "Kano, Kano State", budget_allocated: 1500000000, budget_spent: 800000000, expected_end_date: "2026-08-20", delay_status: "At Risk" },
];

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "high": return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", circle: "#ef4444", bar: "#ef4444" };
    case "medium": return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", circle: "#f59e0b", bar: "#f59e0b" };
    default: return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", circle: "#10b981", bar: "#10b981" };
  }
};

export default function ProgressVision() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/project-tracker/projects").catch(() => ({ data: [] }));
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : MOCK_PROJECTS;
      setProjects(data);
    } catch {
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const stats = {
    total: projects.length,
    onTrack: projects.filter((p) => p.delay_status === "On Schedule").length,
    delayed: projects.filter((p) => p.delay_status === "Delayed" || p.delay_status === "At Risk").length,
    avgCompletion: Math.round(projects.reduce((a, p) => a + p.completion_percentage, 0) / (projects.length || 1)),
  };

  const chartData = projects.map((p) => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
    completion: p.completion_percentage,
    fill: getRiskColor(p.risk_level).bar,
  }));

  if (loading) return <LoadingSkeleton lines={6} />;
  if (error) return <ErrorState message={error} onRetry={loadProjects} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Activity className="w-3 h-3" />
            <span>Visual Progress Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">PROGRESS VISION</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Visual completion deviation analysis and site monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Projects</span>
          <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">On Track</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.onTrack}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Delayed / At Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.delayed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Completion</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-primary">{stats.avgCompletion}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Completion Comparison</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "12px", fontWeight: 800 }}
                  formatter={(value: number) => [`${value}%`, "Completion"]}
                />
                <Bar dataKey="completion" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Timeline & Risk Overview</h3>
          <div className="space-y-4">
            {projects.map((project) => {
              const colors = getRiskColor(project.risk_level);
              const circumference = 2 * Math.PI * 36;
              const offset = circumference * (1 - project.completion_percentage / 100);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-all"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                      <motion.circle
                        cx="40" cy="40" r="36" stroke={colors.circle} strokeWidth="6" fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black">{project.completion_percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-foreground truncate">{project.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground">{project.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {project.risk_level}
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground">
                        {project.delay_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Due</p>
                    <p className="text-xs font-bold text-foreground">
                      {project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
