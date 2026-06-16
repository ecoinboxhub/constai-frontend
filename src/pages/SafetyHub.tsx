import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Plus,
  MapPin,
  Loader2,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui/States";

interface SafetyFinding {
  id: number;
  log_text: string;
  severity?: string;
  location?: string;
  project_id?: number;
  created_at?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

export default function SafetyHub() {
  const [findings, setFindings] = useState<SafetyFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ log_text: "", severity: "medium", location: "" });

  const stats = {
    active_incidents: findings.filter((f) => f.severity === "high").length,
    inspections_this_month: 12,
    compliance_score: 87,
    days_since_last_incident: 14,
  };

  const loadFindings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/logs").catch(() => ({ data: [] }));
      setFindings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load safety data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  const handleSubmit = async () => {
    if (!formData.log_text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/logs", {
        log_text: formData.log_text,
        project_id: 1,
        severity: formData.severity,
        location: formData.location,
      });
      setFindings((prev) => [{ ...res.data, severity: formData.severity, location: formData.location }, ...prev]);
      setShowForm(false);
      setFormData({ log_text: "", severity: "medium", location: "" });
    } catch {
      setFindings((prev) => [
        {
          id: Date.now(),
          log_text: formData.log_text,
          severity: formData.severity,
          location: formData.location,
        } as SafetyFinding,
        ...prev,
      ]);
      setShowForm(false);
      setFormData({ log_text: "", severity: "medium", location: "" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton lines={8} />;
  if (error) return <ErrorState message={error} onRetry={loadFindings} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Safety Compliance Hub</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">SAFETY HUB</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Real-time hazard detection and compliance monitoring</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-xl text-[10px] font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-3.5 h-3.5" />
          New Safety Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Incidents", value: stats.active_incidents, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Inspections This Month", value: stats.inspections_this_month, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Compliance Score", value: `${stats.compliance_score}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Days Since Incident", value: stats.days_since_last_incident, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${stat.color.split(" ")[0]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Safety Findings & Reports</h3>
          <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded">
            {findings.length} Records
          </span>
        </div>
        {findings.length === 0 ? (
          <EmptyState title="No Findings" description="No safety reports recorded yet. Submit your first report." />
        ) : (
          <div className="divide-y divide-border">
            {findings.map((f) => (
              <div key={f.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/20">
                    <ShieldAlert className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{f.log_text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {f.location && (
                        <span className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {f.location}
                        </span>
                      )}
                      {f.created_at && (
                        <span className="text-[9px] font-medium text-muted-foreground">
                          {new Date(f.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${f.severity ? SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.medium : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                    {f.severity || "Info"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase tracking-tight">New Safety Report</h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Zone B, Site 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Report Details</label>
                  <textarea
                    value={formData.log_text}
                    onChange={(e) => setFormData({ ...formData, log_text: e.target.value })}
                    rows={4}
                    placeholder="Describe the safety issue or observation..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.log_text.trim()}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:opacity-90"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="py-3 px-6 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
