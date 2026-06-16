import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Truck,
  Building2,
  ArrowRight,
  Loader2,
  Search,
  DollarSign,
} from "lucide-react";
import api from "@/lib/api";
import { MATERIAL_PRICES } from "@/lib/dummy_data";
import { LoadingSkeleton, ErrorState } from "@/components/ui/States";

interface MaterialItem {
  id: string;
  category: string;
  name: string;
  price: number;
  unit: string;
  trend: string;
  supplier: string;
}

interface Project {
  id: number;
  name: string;
  material_cost: number;
}

const MATERIAL_OPTIONS = [
  { value: "Cement", label: "Cement" },
  { value: "Steel", label: "Steel Rebars" },
  { value: "Aggregates", label: "Sand" },
  { value: "Aggregates_granite", label: "Granite" },
];

export default function ProcurementAssistant() {
  const [selectedMaterial, setSelectedMaterial] = useState("Cement");
  const [prices, setPrices] = useState<MaterialItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = MATERIAL_PRICES.filter((m) => m.category === selectedMaterial || (selectedMaterial === "Aggregates_granite" && m.name.toLowerCase().includes("granite")));
    setPrices(filtered);
  }, [selectedMaterial]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/project-tracker/projects").catch(() => ({ data: [] }));
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load project data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    setRequesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRequesting(false);
  };

  const formatNaira = (n: number) => "₦" + n.toLocaleString("en-US");

  const trendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
      case "down": return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  if (loading) return <LoadingSkeleton lines={6} />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <ShoppingCart className="w-3 h-3" />
            <span>Procurement Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">PROCUREMENT ASSISTANT</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Supplier intelligence and materials price forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Material Price Lookup</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {MATERIAL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              {selectedProject && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Project Material Budget</p>
                  <p className="text-lg font-black text-blue-900">
                    {formatNaira(projects.find((p) => p.id === selectedProject)?.material_cost || 0)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Project Selector</h2>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Project (optional)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Supplier Price Comparison</h3>
              <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded">{prices.length} Quotes</span>
            </div>
            <div className="divide-y divide-border">
              {prices.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/20">
                      <Truck className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">{item.supplier} · per {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{formatNaira(item.price)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        {trendIcon(item.trend)}
                        <span className="text-[9px] font-medium text-muted-foreground capitalize">{item.trend}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleRequestQuote}
                      disabled={requesting}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      {requesting ? "..." : "Quote"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Market Intelligence</p>
                <p className="text-xl font-black leading-tight">
                  {selectedMaterial === "Cement" ? "Cement prices up 4.2% this quarter" :
                   selectedMaterial === "Steel" ? "Steel rebars stable with local supply" :
                   selectedMaterial === "Aggregates" ? "Sand supply steady in Lagos region" :
                   "Granite prices up due to quarry demand"}
                </p>
              </div>
              <DollarSign className="w-16 h-16 text-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
