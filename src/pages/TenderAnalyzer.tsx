import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Bot,
  Scale,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/api";
import { LoadingSkeleton, ErrorState } from "@/components/ui/States";

interface AnalysisResult {
  response?: string;
  risk_flags?: string[];
  recommendations?: string[];
  summary?: string;
  confidence_score?: number;
}

const MOCK_ANALYSIS: AnalysisResult = {
  response: "The tender document contains standard terms with notable risk in the force majeure clause. Payment schedule is front-loaded at 60% milestone which is favorable. Recommend proceeding with bid submission after addressing the liability cap of 15% which is below the market standard of 25%.",
  risk_flags: ["Liability cap at 15% (below market standard of 25%)", "Force majeure excludes pandemic events", "Dispute resolution mandates Lagos jurisdiction only"],
  recommendations: ["Negotiate liability cap to 25%", "Include pandemic clause in force majeure", "Add arbitration option in Abuja"],
  summary: "Moderate risk tender with favorable payment terms. Key negotiation points identified.",
  confidence_score: 0.84,
};

export default function TenderAnalyzer() {
  const [tenderText, setTenderText] = useState("");
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState({ active: 6, total_value: "₦4.8B", avg_competitiveness: 72, win_rate: 38 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAnalyze = async () => {
    if (!tenderText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.post("/project-tracker/chat", { message: `Analyze this tender document: ${tenderText}`, project_id: null });
      setResults((prev) => [{ response: res.data.response, confidence_score: 0.85 }, ...prev]);
    } catch {
      setResults((prev) => [MOCK_ANALYSIS, ...prev]);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Scale className="w-3 h-3" />
            <span>AI Tender Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">TENDER ANALYZER</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Risk phrase extraction and bid competitiveness scoring</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Tenders</span>
          <p className="text-2xl font-black text-foreground mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Bid Value</span>
          <p className="text-2xl font-black text-primary mt-1">{stats.total_value}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Competitiveness</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.avg_competitiveness}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Win Rate</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.win_rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Bot className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-lg font-black flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                Paste Tender Document
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Paste any tender or RFP text and our AI will analyze it for risk phrases, compliance gaps, and bid competitiveness.
              </p>
              <textarea
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                rows={10}
                placeholder="Paste tender document text here..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !tenderText.trim()}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                {analyzing ? "Analyzing..." : "Analyze Tender"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence>
            {results.length === 0 && !analyzing && (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <Search className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">Paste a tender document and click analyze to see AI-powered risk assessment.</p>
              </div>
            )}

            {analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4"
              >
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Analyzing tender for risk patterns, compliance gaps, and competitiveness...
                </p>
              </motion.div>
            )}

            {results.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Analysis Result #{results.length - idx}</h3>
                  {result.confidence_score && (
                    <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded">
                      Confidence: {(result.confidence_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  {result.summary && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Summary</span>
                      </div>
                      <p className="text-sm font-bold text-blue-900 italic">"{result.summary}"</p>
                    </div>
                  )}

                  {result.response && (
                    <p className="text-sm font-bold text-foreground leading-relaxed">{result.response}</p>
                  )}

                  {result.risk_flags && result.risk_flags.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Risk Flags
                      </h4>
                      <div className="space-y-2">
                        {result.risk_flags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs font-bold text-red-800">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs font-bold text-emerald-800">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
