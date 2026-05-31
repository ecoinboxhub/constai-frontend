import { 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Calculator,
  FileText,
  ShoppingCart,
  Users,
  Wrench,
  Search,
  Settings
} from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: "cost" | "safety" | "progress" | "docs" | "procurement" | "workforce" | "maintenance" | "tender" | "settings";
}

const iconMap = {
  cost: Calculator,
  safety: ShieldAlert,
  progress: Activity,
  docs: FileText,
  procurement: ShoppingCart,
  workforce: Users,
  maintenance: Wrench,
  tender: Search,
  settings: Settings,
};

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const Icon = iconMap[icon];
  return (
    <div className="p-8 rounded-[2.5rem] bg-white shadow-xl border border-slate-200 min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner mb-8">
        <Icon className="w-12 h-12" />
      </div>
      
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">{title}</h1>
        <p className="text-xl font-medium text-slate-500 mb-12">{description}</p>
        
        <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
          <p className="text-slate-800 font-bold text-lg leading-relaxed mb-8">
            This section is coming soon and will be fully integrated with live project data, risk analytics, and AI insights.
          </p>
          <div className="flex items-center justify-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
            <ArrowRight className="w-5 h-5 animate-bounce-x" />
            <span>Stay tuned for the next release.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
