import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Loader2,
  MapPin,
  Users,
  Plus,
  Send,
  Upload,
  AlertCircle,
  Zap,
  Search,
  CloudRain,
  Sun,
  ChevronLeft
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { trackUIEvent } from "@/lib/uiEventTracker";
import { ErrorState, EmptyState } from "@/components/ui/States";

// Types
interface Project {
  id: number;
  name: string;
  contractor_name: string;
  location: string;
  project_type: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  project_status: string;
  budget_allocated: number;
  budget_spent: number | null;
  workforce_count: number;
  equipment_count: number;
  material_cost: number;
  completion_percentage: number;
  weather_delay_days: number;
  safety_incidents: number;
  inspection_score: number;
  task_completion_rate: number;
  daily_progress_rate: number;
  delay_status: string;
  risk_level: string;
  state: string | null;
  lga: string | null;
}

interface WorkforceMember {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  skills: string | null;
  is_active: boolean;
  project_id: number | null;
}

interface DashboardMetrics {
  total_projects: number;
  active_projects: number;
  delayed_projects: number;
  completed_projects: number;
  average_completion: number;
  average_budget_utilization: number;
  delay_probability: number;
  risk_score: number;
  active_issues: number;
  productivity_index: number;
}

interface Prediction {
  project_id: number;
  delay_probability: number;
  budget_overrun_probability: number;
  risk_classification: string;
  estimated_completion_date: string | null;
  completion_forecast: number;
  cost_trend: number;
}

interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Standalone Delay Prediction Module - MVP
export function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "live-feed" | "quick-predict" | "projects" | "insights" | "workforce">("dashboard");
  const [workforce, setWorkforce] = useState<WorkforceMember[]>([]);
  const [showNewWorkerForm, setShowNewWorkerForm] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({ first_name: "", last_name: "", role: "Engineer", skills: "", project_id: "" });
  const [creatingWorker, setCreatingWorker] = useState(false);
  
  // Quick Predict State
  const [quickPredictData, setQuickPredictData] = useState({
    budget_allocated: 10000000,
    budget_spent: 2000000,
    workforce_count: 50,
    equipment_count: 10,
    material_cost: 3000000,
    completion_percentage: 20,
    weather_delay_days: 2,
    safety_incidents: 0,
    inspection_score: 85,
    task_completion_rate: 0.8,
    daily_progress_rate: 0.5,
  });
  const [quickPredictResult, setQuickPredictResult] = useState<any>(null);
  const [quickPredictLoading, setQuickPredictLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectCreateMessage, setProjectCreateMessage] = useState("");
  
  const [showFindSiteModal, setShowFindSiteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogData, setNewLogData] = useState({ project_id: "", log_text: "" });
  const [creatingLog, setCreatingLog] = useState(false);
  
  const [llmConnected, setLlmConnected] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newProjectData, setNewProjectData] = useState({
    name: "",
    contractor_name: "",
    location: "",
    project_type: "Infrastructure",
    start_date: "",
    expected_end_date: "",
    budget_allocated: 0,
    budget_spent: 0,
    workforce_count: 0,
    equipment_count: 0,
    material_cost: 0,
    completion_percentage: 0,
    weather_delay_days: 0,
    safety_incidents: 0,
    inspection_score: 0,
    task_completion_rate: 0.5,
    daily_progress_rate: 0,
    delay_status: "On Schedule",
    risk_level: "Low",
    project_status: "Planning",
    state: "",
    lga: ""
  });

  const [selectedCity, setSelectedCity] = useState("Lagos");
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedChatProject, setSelectedChatProject] = useState<number>(1);

  useEffect(() => {
    loadDashboard();
    checkLLMHealth();
  }, []);

  const checkLLMHealth = async () => {
    try {
      const res = await fetch("https://constai-backend.onrender.com/ready");
      const data = await res.json();
      if (data?.ai_providers?.gemini || data?.ai_providers?.groq || data?.ai_providers?.openrouter) {
        setLlmConnected(true);
      }
    } catch {
      // LLM health check failed, badge stays offline until first chat
    }
  };

  useEffect(() => {
    loadWeather();
  }, [selectedCity]);

  useEffect(() => {
    if (projects.length > 0 && selectedChatProject === 1) {
      setSelectedChatProject(projects[0].id);
    }
  }, [projects]);

  const loadWeather = async () => {
    console.log(`[Frontend] Fetching weather for: ${selectedCity}`);
    setWeatherLoading(true);
    try {
      const res = await api.get(`/project-tracker/weather/${encodeURIComponent(selectedCity)}`);
      console.log("[Frontend] Weather response:", res.data);
      setWeather(res.data);
    } catch (err) {
      console.error("[Frontend] Failed to load weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadDashboard = async (retries = 2) => {
    console.log("[Frontend] Loading dashboard metrics and projects...");
    setLoading(true);
    let loaded = false;
    for (let attempt = 0; attempt <= retries && !loaded; attempt++) {
      try {
        const [projectsRes, metricsRes, workforceRes] = await Promise.all([
          api.get("/project-tracker/projects"),
          api.get("/project-tracker/analytics"),
          api.get("/workforce").catch(() => ({ data: [] }))
        ]);
        console.log("[Frontend] Projects loaded:", projectsRes.data.length);
        console.log("[Frontend] Metrics loaded:", metricsRes.data);
        
        setProjects(projectsRes.data);
        setMetrics(metricsRes.data);
        setWorkforce(workforceRes.data);

        const preds: Record<number, Prediction> = {};
        for (const project of projectsRes.data) {
          try {
            const predRes = await api.get(`/project-tracker/predictions/${project.id}`);
            preds[project.id] = predRes.data;
          } catch { /* skip */ }
        }
        setPredictions(preds);
        loaded = true;
      } catch (err) {
        console.error(`[Frontend] Failed to load dashboard (attempt ${attempt + 1}/${retries + 1}):`, err);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        }
      }
    }
    setLoading(false);
  };

  const handleQuickPredict = async () => {
    setQuickPredictLoading(true);
    try {
      const res = await api.post("/project-tracker/quick-predict", quickPredictData);
      setQuickPredictResult(res.data);
    } catch (err) {
      console.error("Quick predict failed:", err);
      alert("Failed to get prediction from AI engine.");
    } finally {
      setQuickPredictLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const projectId = projects.length > 0 ? selectedChatProject : null;
      const res = await api.post("/project-tracker/chat", { message: chatInput, project_id: projectId });
      setChatMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
      setLlmConnected(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 503) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "AI service is temporarily unavailable. Please try again." }]);
      } else if (status === 401) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "Session expired. Please log in again." }]);
      } else if (detail?.includes("Project not found")) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "Selected project was not found. Try asking without a specific project." }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "AI Assistant is currently offline." }]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setCreatingProject(true);
    try {
      if (editingProjectId) {
        const res = await api.put(`/project-tracker/projects/${editingProjectId}`, newProjectData);
        setProjects(prev => prev.map(p => p.id === editingProjectId ? res.data : p));
        setProjectCreateMessage("Project updated successfully.");
      } else {
        const res = await api.post("/project-tracker/projects", newProjectData);
        setProjects((prev) => [res.data, ...prev]);
        setProjectCreateMessage("Project saved and indexed for prediction.");
      }
      setShowNewProjectForm(false);
      setEditingProjectId(null);
      await loadDashboard();
    } catch (err) {
      setProjectCreateMessage(`Failed to ${editingProjectId ? 'update' : 'save'} project.`);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleEditProject = async (project: Project) => {
    setEditingProjectId(project.id);
    setNewProjectData({
      name: project.name,
      contractor_name: project.contractor_name,
      location: project.location,
      project_type: project.project_type,
      start_date: project.start_date || "",
      expected_end_date: project.expected_end_date || "",
      budget_allocated: project.budget_allocated,
      budget_spent: project.budget_spent || 0,
      workforce_count: project.workforce_count,
      equipment_count: project.equipment_count,
      material_cost: project.material_cost,
      completion_percentage: project.completion_percentage,
      weather_delay_days: project.weather_delay_days,
      safety_incidents: project.safety_incidents,
      inspection_score: project.inspection_score,
      task_completion_rate: project.task_completion_rate,
      daily_progress_rate: project.daily_progress_rate,
      delay_status: project.delay_status,
      risk_level: project.risk_level,
      project_status: project.project_status,
      state: project.state || "",
      lga: project.lga || ""
    });
    setShowNewProjectForm(true);
    // Fetch detailed project data to ensure we have the latest
    try {
      await api.get(`/project-tracker/projects/${project.id}`);
      // optionally update form with response data
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/project-tracker/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project.");
    }
  };

  const handleFindSite = () => {
    setActiveTab("projects");
    setShowFindSiteModal(true);
  };

  const handleCreateWorker = async () => {
    if (!newWorkerData.first_name || !newWorkerData.last_name) return;
    setCreatingWorker(true);
    try {
      const res = await api.post("/workforce", newWorkerData);
      setWorkforce((prev) => [res.data, ...prev]);
      setShowNewWorkerForm(false);
      setNewWorkerData({ first_name: "", last_name: "", role: "Engineer", skills: "", project_id: "" });
    } catch (err) {
      console.error("Failed to create worker:", err);
      alert("Failed to create workforce member.");
    } finally {
      setCreatingWorker(false);
    }
  };

  const handleCreateLog = async () => {
    if (!newLogData.project_id || !newLogData.log_text) return;
    setCreatingLog(true);
    try {
      await api.post("/logs", newLogData);
      setShowNewLogModal(false);
      setNewLogData({ project_id: "", log_text: "" });
      alert("Log created successfully!");
    } catch (err) {
      console.error("Failed to create log:", err);
      alert("Failed to create log.");
    } finally {
      setCreatingLog(false);
    }
  };

  const handleFileUpload = async (projectId: number) => {
    if (!selectedFile) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await api.post(`/project-tracker/documents/upload?project_id=${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Document uploaded and indexed into Knowledge Base.");
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to index document.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRagQuery = async () => {
    if (!chatInput.trim()) return;
    if (projects.length === 0) {
      setChatMessages((prev) => [...prev, { role: "user", content: `[RAG QUERY] ${chatInput}` }, { role: "assistant", content: "Load a project first before searching the knowledge base." }]);
      setChatInput("");
      return;
    }
    setChatMessages((prev) => [...prev, { role: "user", content: `[RAG QUERY] ${chatInput}` }]);
    setChatLoading(true);
    try {
      const res = await api.post("/project-tracker/rag/query", { project_id: selectedChatProject, question: chatInput });
      setChatMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
      setChatInput("");
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Document Intelligence is currently offline." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return "text-red-600 bg-red-50 border-red-100";
      case "medium": return "text-amber-600 bg-amber-50 border-amber-100";
      case "low": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Company Workspace: NIGERIA OPERATIONS</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            PROJECT <span className="text-primary">INTELLIGENCE</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Monitoring {projects.length} active construction sites across Nigeria
          </p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {(["dashboard", "projects", "workforce", "insights"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button 
            data-test="find-site"
            onClick={() => {
              trackUIEvent("find_site_clicked", { source: "MVPModules", label: "Find Site" });
              handleFindSite();
            }}
            className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-5 py-2.5 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest"
          >
            <Search className="w-3.5 h-3.5" />
            Find Site
          </button>
          <button 
            data-test="new-log"
            onClick={() => {
              trackUIEvent("new_log_clicked", { source: "MVPModules", label: "New Log" });
              setShowNewLogModal(true);
            }}
            className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-2xl text-[10px] font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
          >
            <Plus className="w-3.5 h-3.5" />
            New Log
          </button>
        </div>
      </div>

      {activeTab === ("live-feed" as any) && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-4 relative overflow-hidden aspect-video shadow-2xl flex items-center justify-center group cursor-pointer">
              <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  Live Hub-LAG-01
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                  Cam: South-Gate
                </div>
              </div>
              
              <Activity className="w-16 h-16 text-slate-700 group-hover:scale-110 group-hover:text-primary transition-all duration-700" />
              <p className="absolute bottom-6 left-6 text-[10px] font-mono text-slate-500">Connecting to neural processing cluster...</p>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col h-full">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-900">Neural Activity Log</h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {[
                  { time: "10:42:01", msg: "Object detected: Crane-04 (Action: Lifting)", type: "info" },
                  { time: "10:42:15", msg: "Safety Protocol: All personnel verified", type: "success" },
                  { time: "10:43:04", msg: "Progress Check: Zone B-4 completion +1.2%", type: "success" },
                  { time: "10:45:22", msg: "Resource Alert: Low cement inventory at SILO-A", type: "warning" },
                  { time: "10:48:10", msg: "Weather Alert: Approaching storm front", type: "warning" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-slate-50 pb-3">
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">{log.time}</span>
                    <p className={`text-[11px] font-bold ${log.type === "warning" ? "text-amber-600" : log.type === "success" ? "text-emerald-600" : "text-slate-600"}`}>
                      {log.msg}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                Export Full Log
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !metrics && (
        <ErrorState
          message="We're unable to reach the project intelligence engine. Please check your network or try refreshing."
          onRetry={() => loadDashboard()}
        />
      )}

      {activeTab === "dashboard" && metrics && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* SVG RISK DIAL (Unified on 3000) */}
            <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 self-start">Aggregate Portfolio Risk</p>
              
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <motion.circle
                    cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 80}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 80) * (1 - metrics.risk_score / 100) }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                    className={metrics.risk_score > 70 ? "text-red-500" : metrics.risk_score > 30 ? "text-amber-500" : "text-primary"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{metrics.risk_score.toFixed(0)}%</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calculated Risk</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Predictive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Live Feed</span>
                </div>
              </div>
            </div>

            {/* Weather Intelligence (Unified on 3000) */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weather Intelligence</p>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-lg outline-none border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <optgroup label="FCT & Area Councils">
                      <option value="Abuja">ABUJA (FCT)</option>
                      <option value="Municipal">MUNICIPAL</option>
                      <option value="Abaji">ABAJI</option>
                      <option value="Bwari">BWARI</option>
                      <option value="Gwagwalada">GWAGWALADA</option>
                      <option value="Kuje">KUJE</option>
                      <option value="Kwali">KWALI</option>
                    </optgroup>
                    <optgroup label="States">
                      {[
                        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
                        "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", 
                        "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
                        "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", 
                        "Sokoto", "Taraba", "Yobe", "Zamfara"
                      ].sort().map(state => (
                        <option key={state} value={state}>{state.toUpperCase()}</option>
                      ))}
                    </optgroup>
                  </select>
                  <button 
                    onClick={() => loadWeather()}
                    disabled={weatherLoading}
                    className="p-1.5 bg-slate-100 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors text-slate-500"
                    title="Refresh Weather"
                  >
                    <Activity className={`w-3 h-3 ${weatherLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {weatherLoading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : weather ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-black text-slate-900 tracking-tight">{weather.temperature_c}°C</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{weather.condition}</p>
                    </div>
                    {weather.condition?.toLowerCase().includes("sun") ? <Sun className="w-10 h-10 text-primary" /> : <CloudRain className="w-10 h-10 text-primary" />}
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-[9px] font-black text-primary uppercase mb-1">AI Advisory</p>
                    <p className="text-[10px] text-slate-500 font-bold italic leading-tight">
                      {weather.rainfall_mm > 10 ? "Heavy rain expected. Secure site." : "Optimal for concrete work."}
                    </p>
                  </div>
                </div>
              ) : <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 italic">Data Unavailable</div>}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Core Status</p>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-white uppercase tracking-widest">Neural Link Active</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">LATENCY: 14MS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Visual Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900">Delay Risk Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projects.map(p => ({ name: p.name.substring(0, 8), risk: (predictions[p.id]?.delay_probability || 0) * 100 }))}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "12px", fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-center">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Productivity Insight</p>
                <h4 className="text-2xl font-black text-emerald-900 tracking-tight leading-tight">
                  Portfolio is operating at <span className="text-emerald-600">{metrics.productivity_index.toFixed(1)}%</span> efficiency.
                </h4>
                <p className="text-sm font-medium text-emerald-700/80 mt-4 leading-relaxed">
                  The current task completion rate suggests a stable delivery cycle, though 3 projects remain at risk due to supply chain bottlenecks.
                </p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">High Risk Alerts</h3>
                  <div className="px-2 py-1 bg-red-100 text-red-600 text-[9px] font-black rounded uppercase">Immediate Action</div>
                </div>
                <div className="space-y-3">
                  {projects.filter(p => p.risk_level.toLowerCase() === "high").slice(0, 2).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div>
                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{p.location}</p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  ))}
                  {projects.filter(p => p.risk_level.toLowerCase() === "high").length === 0 && (
                    <EmptyState title="All Clear" description="No critical alerts detected" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "quick-predict" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tight mb-8">Instant Delay Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Budget Allocated", key: "budget_allocated", type: "number" },
                { label: "Budget Spent", key: "budget_spent", type: "number" },
                { label: "Workforce Count", key: "workforce_count", type: "number" },
                { label: "Completion %", key: "completion_percentage", type: "number", max: 100 },
                { label: "Weather Delay Days", key: "weather_delay_days", type: "number" },
                { label: "Safety Incidents", key: "safety_incidents", type: "number" },
                { label: "Task Completion Rate", key: "task_completion_rate", type: "number", step: 0.1, max: 1 },
                { label: "Daily Progress Rate", key: "daily_progress_rate", type: "number", step: 0.1 },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                  <input
                    type={field.type}
                    value={(quickPredictData as any)[field.key]}
                    onChange={(e) => setQuickPredictData({ ...quickPredictData, [field.key]: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleQuickPredict}
              disabled={quickPredictLoading}
              className="w-full mt-10 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {quickPredictLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Generate AI Prediction"}
            </button>
          </div>

          <div className="space-y-6">
            {quickPredictResult ? (
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16" />
                
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">AI Assessment</p>
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-5xl font-black tracking-tighter">{(quickPredictResult.delay_probability * 100).toFixed(1)}%</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Delay Probability</p>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${
                    quickPredictResult.risk_level === "high" ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  }`}>
                    {quickPredictResult.risk_level} Risk
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Expert Advisory</p>
                    <p className="text-sm font-semibold leading-relaxed italic text-slate-200">
                      "{quickPredictResult.advisory}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Key Risk Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPredictResult.key_risk_factors.map((factor: string, i: number) => (
                        <div key={i} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold">
                          {factor}
                        </div>
                      ))}
                      {quickPredictResult.key_risk_factors.length === 0 && (
                        <p className="text-xs text-slate-400">No significant risks identified.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <Zap className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">Enter project parameters and run the AI engine to see results here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Saved Projects</h2>
              <p className="text-sm text-slate-500 font-medium">Monitoring {projects.length} active construction sites</p>
            </div>
            <div className="flex items-center gap-4">
              {showFindSiteModal && (
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search by name or location..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400 w-48"
                    autoFocus
                  />
                  <button onClick={() => {setShowFindSiteModal(false); setSearchQuery("");}} className="text-slate-400 hover:text-slate-600 ml-2">×</button>
                </div>
              )}
              <button
                data-test="register-project"
                onClick={() => {
                  trackUIEvent("register_project_clicked", { source: "MVPModules", label: "Register Project" });
                  setEditingProjectId(null);
                  setNewProjectData({
                    name: "", contractor_name: "", location: "", project_type: "Infrastructure",
                    start_date: "", expected_end_date: "", budget_allocated: 0, budget_spent: 0,
                    workforce_count: 0, equipment_count: 0, material_cost: 0, completion_percentage: 0,
                    weather_delay_days: 0, safety_incidents: 0, inspection_score: 0, task_completion_rate: 0.5,
                    daily_progress_rate: 0, delay_status: "On Schedule", risk_level: "Low", project_status: "Planning",
                    state: "", lga: ""
                  });
                  setShowNewProjectForm(!showNewProjectForm);
                }}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform"
              >
                + Register Project
              </button>
            </div>
          </div>

          {showNewProjectForm && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900">
                {editingProjectId ? "Edit Project" : "Register New Project"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Project Name" 
                  value={newProjectData.name}
                  onChange={e => setNewProjectData({...newProjectData, name: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="text" 
                  placeholder="Contractor Name" 
                  value={newProjectData.contractor_name}
                  onChange={e => setNewProjectData({...newProjectData, contractor_name: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={newProjectData.location}
                  onChange={e => setNewProjectData({...newProjectData, location: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select 
                  value={newProjectData.project_type}
                  onChange={e => setNewProjectData({...newProjectData, project_type: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Budget Allocated" 
                  value={newProjectData.budget_allocated || ""}
                  onChange={e => setNewProjectData({...newProjectData, budget_allocated: Number(e.target.value)})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="date" 
                  placeholder="Start Date"
                  value={newProjectData.start_date}
                  onChange={e => setNewProjectData({...newProjectData, start_date: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="date" 
                  placeholder="Expected End Date"
                  value={newProjectData.expected_end_date}
                  onChange={e => setNewProjectData({...newProjectData, expected_end_date: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="text" 
                  placeholder="State (e.g., Lagos)"
                  value={newProjectData.state}
                  onChange={e => setNewProjectData({...newProjectData, state: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input 
                  type="text" 
                  placeholder="LGA (e.g., Ikeja)"
                  value={newProjectData.lga}
                  onChange={e => setNewProjectData({...newProjectData, lga: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={handleCreateProject}
                  disabled={creatingProject}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {creatingProject ? "Saving..." : (editingProjectId ? "Update Project" : "Save Project")}
                </button>
                <button 
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setEditingProjectId(null);
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
              {projectCreateMessage && <p className="mt-4 text-xs font-bold text-emerald-600">{projectCreateMessage}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())).map((project) => {
              const pred = predictions[project.id];
              return (
              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{project.location} {project.state ? `- ${project.state}` : ''}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border ${
                    pred ? getRiskColor(pred.risk_classification) : getRiskColor(project.risk_level)
                  }`}>
                    {pred ? pred.risk_classification : project.risk_level} Risk
                  </div>
                </div>

                {pred && (
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100/50">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs font-black" style={{ color: pred.delay_probability > 0.5 ? '#dc2626' : pred.delay_probability > 0.25 ? '#d97706' : '#059669' }}>
                          {(pred.delay_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Delay</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black" style={{ color: pred.budget_overrun_probability > 0.5 ? '#dc2626' : pred.budget_overrun_probability > 0.25 ? '#d97706' : '#059669' }}>
                          {(pred.budget_overrun_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Budget</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black text-slate-900">{project.completion_percentage.toFixed(0)}%</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Complete</div>
                      </div>
                    </div>
                  </div>
                )}

                {!pred && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Completion</p>
                      <p className="text-lg font-black text-slate-900">{project.completion_percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Delay Prob.</p>
                      <p className="text-lg font-black text-primary">N/A</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEditProject(project); }} className="text-[9px] font-black text-slate-400 hover:text-primary uppercase">Edit</button>
                    <button onClick={(e) => handleDeleteProject(project.id, e)} className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase">Delete</button>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "workforce" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Workforce Management</h2>
              <p className="text-sm text-slate-500 font-medium">Managing {workforce.length} active personnel</p>
            </div>
            <button
              onClick={() => setShowNewWorkerForm(!showNewWorkerForm)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform"
            >
              + Register Worker
            </button>
          </div>

          {showNewWorkerForm && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900">Register New Personnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={newWorkerData.first_name}
                  onChange={e => setNewWorkerData({...newWorkerData, first_name: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={newWorkerData.last_name}
                  onChange={e => setNewWorkerData({...newWorkerData, last_name: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <select 
                  value={newWorkerData.role}
                  onChange={e => setNewWorkerData({...newWorkerData, role: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Site Manager">Site Manager</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Foreman">Foreman</option>
                  <option value="Laborer">Laborer</option>
                  <option value="Architect">Architect</option>
                  <option value="Surveyor">Surveyor</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Skills (comma separated)" 
                  value={newWorkerData.skills}
                  onChange={e => setNewWorkerData({...newWorkerData, skills: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <select 
                  value={newWorkerData.project_id}
                  onChange={e => setNewWorkerData({...newWorkerData, project_id: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Assign to Project (Optional)</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={handleCreateWorker}
                  disabled={creatingWorker}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {creatingWorker ? "Saving..." : "Save Personnel"}
                </button>
                <button 
                  onClick={() => setShowNewWorkerForm(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workforce.map((worker) => (
              <motion.div
                key={worker.id}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{worker.first_name} {worker.last_name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{worker.role}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${worker.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Assigned Project</p>
                  <p className="text-sm font-bold text-slate-700">
                    {worker.project_id ? projects.find(p => p.id === worker.project_id)?.name || "Unknown Project" : "Unassigned"}
                  </p>
                </div>
              </motion.div>
            ))}
            {workforce.length === 0 && !showNewWorkerForm && (
              <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <Users className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">No personnel registered yet. Add your first team member.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">AI Strategy Chat</h2>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Natural Language Project Intelligence</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${llmConnected ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${llmConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{llmConnected ? "Active" : "Offline"}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide px-2">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-50">
                    <Zap className="w-10 h-10 mb-4" />
                    <p className="text-sm font-bold">Ask the AI about portfolio bottlenecks, resource reallocation, or specific project risks.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-3xl font-bold text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-white rounded-br-none shadow-lg shadow-primary/10" 
                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 p-4">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedChatProject}
                  onChange={(e) => setSelectedChatProject(Number(e.target.value))}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                  placeholder="Ask a strategic question..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm font-bold focus:outline-none"
                />
                <button
                  onClick={handleRagQuery}
                  disabled={chatLoading}
                  className="px-4 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-300 transition-colors disabled:opacity-50 text-[9px] font-black uppercase tracking-widest"
                  title="Query Knowledge Base"
                >
                  RAG
                </button>
                <button
                  onClick={handleChatSubmit}
                  disabled={chatLoading}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Knowledge Base Engine</h3>
              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Ingest Document</p>
                  
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-300 mb-4 outline-none focus:ring-1 focus:ring-primary/50"
                    onChange={(e) => setNewProjectData({ ...newProjectData, id: Number(e.target.value) } as any)}
                  >
                    <option value="">Select Project Target...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>

                  <div className="relative group">
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center group-hover:border-primary/50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedFile ? selectedFile.name : "Drop PDF/DOCX here"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => (newProjectData as any).id && handleFileUpload((newProjectData as any).id)}
                    disabled={!selectedFile || uploadLoading || !(newProjectData as any).id}
                    className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Index to Vector Store"}
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Vector Index</p>
                  </div>
                  <p className="text-xs font-bold text-slate-500 italic">project_documents_v1_sw_hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Log Modal */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-black uppercase tracking-tight mb-6">Create New Log</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Select Project</label>
                <select 
                  value={newLogData.project_id}
                  onChange={e => setNewLogData({...newLogData, project_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Log Details</label>
                <textarea 
                  value={newLogData.log_text}
                  onChange={e => setNewLogData({...newLogData, log_text: e.target.value})}
                  rows={4}
                  placeholder="Enter observation, issue, or progress update..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleCreateLog}
                disabled={creatingLog || !newLogData.project_id || !newLogData.log_text}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:opacity-90"
              >
                {creatingLog ? "Saving..." : "Save Log"}
              </button>
              <button 
                onClick={() => setShowNewLogModal(false)}
                className="py-3 px-6 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
