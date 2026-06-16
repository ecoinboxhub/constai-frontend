import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Plus,
  UserPlus,
  Filter,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui/States";

interface WorkforceMember {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  skills: string | null;
  is_active: boolean;
  project_id: number | null;
}

interface Project {
  id: number;
  name: string;
}

const ROLES = ["Engineer", "Supervisor", "Site Manager", "Foreman", "Laborer", "Architect", "Surveyor"];

export default function WorkforceScheduler() {
  const [workers, setWorkers] = useState<WorkforceMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState<number | "">("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", role: "Engineer", skills: "", project_id: "",
  });

  const loadWorkforce = async () => {
    setLoading(true);
    setError("");
    try {
      const [workersRes, projectsRes] = await Promise.all([
        api.get("/workforce").catch(() => ({ data: [] })),
        api.get("/project-tracker/projects").catch(() => ({ data: [] })),
      ]);
      setWorkers(Array.isArray(workersRes.data) ? workersRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
    } catch {
      setError("Failed to load workforce data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkforce();
  }, []);

  const filteredWorkers = workers.filter((w) => {
    if (roleFilter && w.role !== roleFilter) return false;
    if (projectFilter && w.project_id !== projectFilter) return false;
    return true;
  });

  const stats = {
    total: workers.length,
    active: workers.filter((w) => w.is_active).length,
    byRole: ROLES.map((role) => ({
      role,
      count: workers.filter((w) => w.role === role).length,
    })),
  };

  const handleCreateWorker = async () => {
    if (!formData.first_name || !formData.last_name) return;
    setSubmitting(true);
    try {
      const res = await api.post("/workforce", {
        ...formData,
        project_id: formData.project_id ? Number(formData.project_id) : null,
      });
      setWorkers((prev) => [res.data, ...prev]);
      setShowForm(false);
      setFormData({ first_name: "", last_name: "", role: "Engineer", skills: "", project_id: "" });
    } catch {
      setWorkers((prev) => [
        { id: Date.now(), ...formData, is_active: true, project_id: formData.project_id ? Number(formData.project_id) : null } as WorkforceMember,
        ...prev,
      ]);
      setShowForm(false);
      setFormData({ first_name: "", last_name: "", role: "Engineer", skills: "", project_id: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (worker: WorkforceMember) => {
    try {
      await api.put(`/workforce/${worker.id}`, { ...worker, is_active: !worker.is_active });
      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, is_active: !w.is_active } : w)));
    } catch {
      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, is_active: !w.is_active } : w)));
    }
  };

  if (loading) return <LoadingSkeleton lines={8} />;
  if (error) return <ErrorState message={error} onRetry={loadWorkforce} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Users className="w-3 h-3" />
            <span>Workforce Management</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">WORKFORCE SCHEDULER</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Shift optimization and personnel tracking</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-xl text-[10px] font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Worker
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Workers</p>
          <p className="text-2xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active</p>
          <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Inactive</p>
          <p className="text-2xl font-black text-slate-400">{stats.total - stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Roles</p>
          <p className="text-2xl font-black text-primary">{stats.byRole.filter((r) => r.count > 0).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value ? Number(e.target.value) : "")}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <span className="text-[10px] font-bold text-muted-foreground ml-auto">
            {filteredWorkers.length} of {workers.length} shown
          </span>
        </div>

        {filteredWorkers.length === 0 ? (
          <EmptyState title="No Workers Found" description="Try adjusting filters or add a new worker." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-black">
                      {worker.first_name[0]}{worker.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-foreground group-hover:text-primary transition-colors">
                        {worker.first_name} {worker.last_name}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{worker.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(worker)}
                    className={`p-1.5 rounded-lg transition-all ${worker.is_active ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 bg-slate-50 hover:bg-slate-100"}`}
                    title={worker.is_active ? "Deactivate" : "Activate"}
                  >
                    {worker.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${worker.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                    {worker.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned Project</p>
                  <p className="text-sm font-bold text-foreground">
                    {worker.project_id ? projects.find((p) => p.id === worker.project_id)?.name || "Unknown" : "Unassigned"}
                  </p>
                </div>
                {worker.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {worker.skills.split(",").map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary/50 text-[9px] font-bold text-muted-foreground rounded">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-lg font-black uppercase tracking-tight mb-6">Register New Worker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="col-span-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Assign to Project (Optional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreateWorker}
                disabled={submitting || !formData.first_name || !formData.last_name}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:opacity-90"
              >
                {submitting ? "Saving..." : "Save Personnel"}
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
    </div>
  );
}
