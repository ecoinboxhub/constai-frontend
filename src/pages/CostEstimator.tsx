import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Loader2,
  MapPin,
  HardHat,
  Building2,
  DollarSign,
  TrendingUp,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState } from "@/components/ui/States";

const PROJECT_TYPES = ["Infrastructure", "Commercial", "Residential", "Industrial", "Road Construction"];
const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Kaduna", "Benin City"];

const LOCAL_RATES: Record<string, { labor_rate: number; overhead_pct: number }> = {
  "Lagos": { labor_rate: 4500, overhead_pct: 0.15 },
  "Abuja": { labor_rate: 4200, overhead_pct: 0.14 },
  "Port Harcourt": { labor_rate: 4000, overhead_pct: 0.13 },
  "Kano": { labor_rate: 3200, overhead_pct: 0.11 },
  "Ibadan": { labor_rate: 3500, overhead_pct: 0.12 },
  "Enugu": { labor_rate: 3300, overhead_pct: 0.12 },
  "Kaduna": { labor_rate: 3100, overhead_pct: 0.11 },
  "Benin City": { labor_rate: 3400, overhead_pct: 0.12 },
};

const MATERIAL_BASE_PRICES = {
  cement: 8500,
  steel: 1250000,
  sand: 180000,
  granite: 295000,
};

export default function CostEstimator() {
  const [form, setForm] = useState({
    project_type: "Infrastructure",
    location: "Lagos",
    cement_bags: 500,
    steel_tons: 10,
    sand_trucks: 5,
    granite_trucks: 4,
    labor_headcount: 30,
    duration_days: 180,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/project-tracker/quick-predict", {
        budget_allocated: form.cement_bags * MATERIAL_BASE_PRICES.cement + form.steel_tons * MATERIAL_BASE_PRICES.steel,
        budget_spent: 0,
        workforce_count: form.labor_headcount,
        equipment_count: 5,
        material_cost: form.cement_bags * MATERIAL_BASE_PRICES.cement,
        completion_percentage: 10,
        weather_delay_days: 0,
        safety_incidents: 0,
        inspection_score: 80,
        task_completion_rate: 0.5,
        daily_progress_rate: 0.3,
      });
      setResult({
        ...res.data,
        local_calculation: calculateLocal(),
      });
    } catch {
      setResult({ local_calculation: calculateLocal(), ai_unavailable: true });
    } finally {
      setLoading(false);
    }
  };

  const calculateLocal = () => {
    const rates = LOCAL_RATES[form.location] || LOCAL_RATES["Lagos"];
    const materialCost =
      form.cement_bags * MATERIAL_BASE_PRICES.cement +
      form.steel_tons * MATERIAL_BASE_PRICES.steel +
      form.sand_trucks * MATERIAL_BASE_PRICES.sand +
      form.granite_trucks * MATERIAL_BASE_PRICES.granite;
    const laborCost = form.labor_headcount * rates.labor_rate * form.duration_days;
    const overhead = (materialCost + laborCost) * rates.overhead_pct;
    const total = materialCost + laborCost + overhead;
    return {
      material_cost: materialCost,
      labor_cost: laborCost,
      overhead_cost: overhead,
      total_cost: total,
      labor_rate: rates.labor_rate,
      overhead_pct: rates.overhead_pct,
    };
  };

  const formatNaira = (n: number) =>
    "₦" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const breakdownChartData = result
    ? [
        { name: "Materials", value: result.local_calculation.material_cost },
        { name: "Labor", value: result.local_calculation.labor_cost },
        { name: "Overhead", value: result.local_calculation.overhead_cost },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Calculator className="w-3 h-3" />
            <span>Cost Intelligence Engine</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">COST ESTIMATOR</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Labor-burden aware budget forecasting with Naira pricing</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NBC 2023 Compliant
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest mb-6">Project Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Type</label>
                <select
                  value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cement (50kg bags)</label>
                <input
                  type="number"
                  value={form.cement_bags}
                  onChange={(e) => setForm({ ...form, cement_bags: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Steel (tons)</label>
                <input
                  type="number"
                  value={form.steel_tons}
                  onChange={(e) => setForm({ ...form, steel_tons: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sand (truck loads)</label>
                <input
                  type="number"
                  value={form.sand_trucks}
                  onChange={(e) => setForm({ ...form, sand_trucks: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Granite (truck loads)</label>
                <input
                  type="number"
                  value={form.granite_trucks}
                  onChange={(e) => setForm({ ...form, granite_trucks: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Labor Headcount</label>
                <input
                  type="number"
                  value={form.labor_headcount}
                  onChange={(e) => setForm({ ...form, labor_headcount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration (days)</label>
                <input
                  type="number"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PieChart className="w-4 h-4" />}
              {loading ? "Calculating..." : "Calculate Estimate"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {error && <ErrorState message={error} />}

          {loading && (
            <div className="bg-white rounded-2xl border border-border shadow-sm">
              <LoadingSkeleton lines={6} />
            </div>
          )}

          {!loading && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Estimated Cost</p>
                  <p className="text-4xl font-black tracking-tighter mb-2">
                    {formatNaira(result.local_calculation.total_cost)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {form.project_type} Project in {form.location}
                  </p>

                  {!result.ai_unavailable && (
                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Confidence</span>
                        <span className="text-sm font-black">
                          {((1 - (result.delay_probability || 0)) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 italic font-medium">
                        "{result.advisory || "Estimate computed successfully."}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Cost Breakdown</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Materials", value: result.local_calculation.material_cost, icon: Building2, color: "text-blue-600" },
                    { label: "Labor", value: result.local_calculation.labor_cost, icon: HardHat, color: "text-emerald-600" },
                    { label: "Overhead", value: result.local_calculation.overhead_cost, icon: TrendingUp, color: "text-amber-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                      <span className="text-xs font-black">{formatNaira(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={breakdownChartData}>
                      <defs>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "12px", fontWeight: 800 }} formatter={(v: number) => [formatNaira(v), ""]} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#costGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !result && !error && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Calculator className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-400">Fill in project parameters and calculate an estimate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
