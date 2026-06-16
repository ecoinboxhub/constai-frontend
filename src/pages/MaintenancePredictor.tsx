import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  Loader2,
  Thermometer,
  HardDrive,
  CalendarDays,
} from "lucide-react";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/ui/States";

interface Equipment {
  id: number;
  name?: string;
  equipment_type: string;
  serial_number?: string;
  runtime_hours?: number;
  last_maintenance_date?: string;
  health_score?: number;
  failure_risk?: number;
  status?: string;
}

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 1, equipment_type: "Crane", serial_number: "CR-2024-001", runtime_hours: 2450, last_maintenance_date: "2025-12-15", health_score: 78, failure_risk: 22, status: "operational" },
  { id: 2, equipment_type: "Excavator", serial_number: "EX-2023-042", runtime_hours: 5400, last_maintenance_date: "2025-10-20", health_score: 62, failure_risk: 45, status: "needs_service" },
  { id: 3, equipment_type: "Concrete Mixer", serial_number: "CM-2024-018", runtime_hours: 1200, last_maintenance_date: "2026-01-10", health_score: 91, failure_risk: 8, status: "operational" },
  { id: 4, equipment_type: "Bulldozer", serial_number: "BD-2022-007", runtime_hours: 8200, last_maintenance_date: "2025-08-05", health_score: 45, failure_risk: 68, status: "overdue" },
  { id: 5, equipment_type: "Generator", serial_number: "GN-2024-033", runtime_hours: 890, last_maintenance_date: "2026-03-01", health_score: 95, failure_risk: 5, status: "operational" },
  { id: 6, equipment_type: "Forklift", serial_number: "FL-2023-021", runtime_hours: 3100, last_maintenance_date: "2025-11-12", health_score: 70, failure_risk: 30, status: "operational" },
];

export default function MaintenancePredictor() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/equipment").catch(() => ({ data: [] }));
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : MOCK_EQUIPMENT;
      setEquipment(data);
    } catch {
      setEquipment(MOCK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: equipment.length,
    upcoming: equipment.filter((e) => (e.health_score || 0) < 60).length,
    overdue: equipment.filter((e) => (e.failure_risk || 0) > 50).length,
    avgHealth: Math.round(equipment.reduce((a, e) => a + (e.health_score || 0), 0) / (equipment.length || 1)),
  };

  if (loading) return <LoadingSkeleton lines={6} />;
  if (error) return <ErrorState message={error} onRetry={loadEquipment} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Wrench className="w-3 h-3" />
            <span>Predictive Maintenance Engine</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">MAINTENANCE PREDICTOR</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Equipment risk assessment and preventive schedules</p>
        </div>
        <button
          onClick={loadEquipment}
          className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl text-[10px] font-bold text-foreground hover:bg-secondary transition-all border border-border"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Equipment</span>
            <HardDrive className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Needs Service</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600">{stats.overdue}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-2xl font-black ${stats.avgHealth > 70 ? "text-emerald-600" : stats.avgHealth > 40 ? "text-amber-600" : "text-red-600"}`}>
            {stats.avgHealth}%
          </p>
        </div>
      </div>

      {equipment.length === 0 ? (
        <EmptyState title="No Equipment" description="No equipment registered in the system." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((eq, i) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    (eq.failure_risk || 0) > 50 ? "bg-red-50 border-red-100" :
                    (eq.failure_risk || 0) > 25 ? "bg-amber-50 border-amber-100" :
                    "bg-emerald-50 border-emerald-100"
                  }`}>
                    <Wrench className={`w-5 h-5 ${
                      (eq.failure_risk || 0) > 50 ? "text-red-500" :
                      (eq.failure_risk || 0) > 25 ? "text-amber-500" :
                      "text-emerald-500"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground group-hover:text-primary transition-colors">{eq.equipment_type}</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{eq.serial_number}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border ${
                  (eq.failure_risk || 0) > 50 ? "text-red-600 bg-red-50 border-red-200" :
                  (eq.failure_risk || 0) > 25 ? "text-amber-600 bg-amber-50 border-amber-200" :
                  "text-emerald-600 bg-emerald-50 border-emerald-200"
                }`}>
                  {(eq.failure_risk || 0).toFixed(0)}% Risk
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Runtime Hours</p>
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-black text-foreground">{(eq.runtime_hours || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Health Score</p>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-sm font-black ${(eq.health_score || 0) > 70 ? "text-emerald-600" : (eq.health_score || 0) > 40 ? "text-amber-600" : "text-red-600"}`}>
                      {eq.health_score || 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Last Maintenance: {eq.last_maintenance_date ? new Date(eq.last_maintenance_date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (eq.health_score || 0) > 70 ? "bg-emerald-500" :
                    (eq.health_score || 0) > 40 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${eq.health_score || 0}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
