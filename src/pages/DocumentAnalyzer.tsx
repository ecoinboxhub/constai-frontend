import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Search, 
  Hash,
  Filter,
  FileSearch,
  Bot,
  Scale,
  ShieldCheck,
  ChevronRight,
  Activity
} from "lucide-react";
import { COMPLIANCE_LOGS } from "@/lib/dummy_data";

export default function DocumentAnalyzer() {
  const [query, setQuery] = useState("");
  
  const mutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await api.post("/document-analyzer/review", {
        document_text: q, // In a real app, this would be the actual doc content or a reference
        analysis_type: "legal_compliance"
      });
      return res.data;
    },
  });

  const handleSearch = () => {
    if (!query) return;
    mutation.mutate(query);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Scale className="w-3 h-3" />
            <span>Legal-RAG Intelligence System</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">DOCUMENT INTELLIGENCE</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Compliant with National Building Code (NBC 2023) & COREN Act</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-secondary transition-all border border-border">
             <Filter className="w-4 h-4" />
             FILTER DOCS
           </button>
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
             <Bot className="w-4 h-4" />
             ASK LEGAL AI
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI RAG Search & Vector Store */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-12 opacity-10">
               <Bot className="w-64 h-64 text-white" />
             </div>
             
             <div className="relative z-10 space-y-6">
                <div className="max-w-xl">
                   <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                     <Hash className="w-6 h-6 text-primary" />
                     Semantic Legal Search
                   </h2>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                     Query your project documents against the 2023 Nigerian National Building Code using our vectorized Legal-RAG pipeline.
                   </p>
                </div>

                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. 'What are the fire exit requirements for a 12-story commercial core?'"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-12 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                   </div>
                   <button 
                    onClick={handleSearch}
                    disabled={mutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                   >
                     {mutation.isPending ? <Activity className="w-4 h-4 animate-spin" /> : null}
                     {mutation.isPending ? "Vectorizing..." : "ANALYZE"}
                   </button>
                </div>

                <AnimatePresence>
                  {mutation.isPending && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Scanning 4,821 vector nodes for NBC 2023 compliance matches...
                      </p>
                    </motion.div>
                  )}
                  {mutation.data && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white/5 border border-primary/30 rounded-2xl space-y-4"
                    >
                      <div className="flex justify-between items-center">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Analysis Result</h3>
                         <span className="text-[10px] font-black uppercase text-slate-500">Confidence: {mutation.data.confidence_score * 100}%</span>
                      </div>
                      <p className="text-sm text-white font-medium leading-relaxed italic">
                        "{mutation.data.summary}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                         {mutation.data.citations?.map((cit: string, i: number) => (
                           <span key={i} className="px-2 py-1 bg-primary/20 text-primary text-[8px] font-black rounded uppercase">Ref: {cit}</span>
                         ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* Compliance List */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Compliance Audit Logs</h3>
              <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded">FILTER: NIGERIA</span>
            </div>
            <div className="divide-y divide-border">
               {COMPLIANCE_LOGS.map((log) => (
                 <div key={log.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/20">
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground">{log.type} Section {log.section}</p>
                          <p className="text-[10px] font-medium text-muted-foreground">{log.details}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${log.status === 'Pass' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                         {log.status}
                       </span>
                       <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                         <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right: Document Repository Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Repository Insights</h3>
              
              <div className="space-y-4">
                 {[
                   { label: "Indexed Pages", val: "14,821", icon: Hash },
                   { label: "Analyzed Blueprints", val: "842", icon: FileSearch },
                   { label: "Legal Citations", val: "2,109", icon: Scale },
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold">{stat.label}</span>
                      </div>
                      <span className="text-xs font-black">{stat.val}</span>
                   </div>
                 ))}
              </div>

              <div className="pt-4 border-t border-border">
                 <button className="w-full py-3 bg-secondary/50 border border-border rounded-xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-secondary transition-all shadow-sm">
                   UPLOAD NEW BATCH
                 </button>
              </div>
           </div>

           <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
              <div className="relative z-10">
                 <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-1">Vectorization Status</h4>
                 <p className="text-[10px] font-bold text-primary/80 mb-4 uppercase">Nigerian Building Standards v4.2</p>
                 <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary" style={{ width: "88%" }} />
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-black text-primary uppercase">
                    <span>88% Indexed</span>
                    <span>1,204 Nodes Remaining</span>
                 </div>
              </div>
              <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5" />
           </div>
        </div>
      </div>
    </div>
  );
}
