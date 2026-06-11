import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, BarChart3, Settings, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Loader2,
} from "lucide-react";
import api from "@/lib/api";

type Tab = "health" | "stats" | "config";

interface ModelInfo {
  status: string;
  version?: string;
  algorithm?: string;
  features?: string[];
  model_name?: string;
  training_date?: string;
  best_f1?: number;
  best_r2?: number;
  classes?: string[];
  n_features?: number;
  error?: string;
}

interface HealthData {
  status: string;
  models: Record<string, ModelInfo>;
}

interface StatsData {
  total_predictions: number;
  avg_delay_risk: number;
  will_delay_count: number;
  will_delay_pct: number;
  model_version_counts: Record<string, number>;
  recent_daily_counts: { date: string; count: number; avg_delay_risk: number }[];
}

function HealthTab() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ml/model-health");
      setData(res.data);
    } catch {
      setError("Failed to load model health");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="text-red-600 text-center py-8">{error} <button onClick={fetch} className="underline ml-2">Retry</button></div>;
  if (!data) return null;

  const modelKeys = Object.keys(data.models);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${data.status === "healthy" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            {data.status === "healthy" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {data.status}
          </span>
        </div>
        <button onClick={fetch} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {modelKeys.length === 0 && <p className="text-gray-500 text-center py-8">No models loaded</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelKeys.map((name) => {
          const m = data.models[name];
          return (
            <div key={name} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">{name}</h3>
              {m.error ? (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" /> {m.error}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-green-700">{m.status}</span></div>
                  {m.version && <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-medium">{m.version}</span></div>}
                  {m.algorithm && <div className="flex justify-between"><span className="text-gray-500">Algorithm</span><span className="font-medium">{m.algorithm}</span></div>}
                  {m.best_f1 != null && <div className="flex justify-between"><span className="text-gray-500">Best F1</span><span className="font-medium">{m.best_f1.toFixed(4)}</span></div>}
                  {m.best_r2 != null && <div className="flex justify-between"><span className="text-gray-500">Best R²</span><span className="font-medium">{m.best_r2.toFixed(4)}</span></div>}
                  {m.n_features != null && <div className="flex justify-between"><span className="text-gray-500">Features</span><span className="font-medium">{m.n_features}</span></div>}
                  {m.training_date && <div className="flex justify-between"><span className="text-gray-500">Trained</span><span className="font-medium">{new Date(m.training_date).toLocaleDateString()}</span></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsTab() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ml/stats");
      setData(res.data);
    } catch {
      setError("Failed to load prediction stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="text-red-600 text-center py-8">{error} <button onClick={fetch} className="underline ml-2">Retry</button></div>;
  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Aggregate prediction statistics across all projects</p>
        <button onClick={fetch} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Predictions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.total_predictions}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Delay Risk</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{(data.avg_delay_risk * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Will Delay</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.will_delay_count} <span className="text-sm font-normal text-gray-500">({(data.will_delay_pct * 100).toFixed(1)}%)</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Model Versions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(data.model_version_counts).length || 0}</p>
        </div>
      </div>

      {Object.keys(data.model_version_counts).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Model Version Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.model_version_counts).map(([v, c]) => (
              <div key={v} className="flex items-center gap-3">
                <span className="text-sm font-medium w-32">{v}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(c / data.total_predictions) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recent_daily_counts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Daily Activity (last 30 days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Predictions</th>
                  <th className="pb-2 font-medium">Avg Delay Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_daily_counts.slice(0, 14).map((d) => (
                  <tr key={d.date} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{d.date}</td>
                    <td className="py-2">{d.count}</td>
                    <td className="py-2">{(d.avg_delay_risk * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigTab() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ml/model-config");
      setConfig(res.data.model_config || {});
    } catch {
      setError("Failed to load model config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSet = async (name: string, version: string | null) => {
    setSaving(true);
    setMessage("");
    try {
      const payload: Record<string, string | null> = {};
      payload[name] = version;
      await api.put("/ml/model-config", payload);
      setMessage(`Updated ${name} → ${version || "default"}`);
      fetch();
    } catch {
      setError("Failed to update config");
    } finally {
      setSaving(false);
      setEditKey("");
      setEditValue("");
    }
  };

  const handleClear = async (name: string) => {
    await handleSet(name, null);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Pin specific model versions for predictions. Leave empty to use latest.</p>
        <button onClick={fetch} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {message && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>}

      {editKey && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-3">Set version for <code className="bg-blue-100 px-1.5 py-0.5 rounded">{editKey}</code></p>
          <div className="flex items-center gap-3">
            <input
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. v2.0"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <button
              onClick={() => handleSet(editKey, editValue || null)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setEditKey(""); setEditValue(""); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-5 py-3 font-medium">Model</th>
              <th className="px-5 py-3 font-medium">Active Version</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {["delay_model", "budget_model", "risk_classifier"].map((name) => (
              <tr key={name} className="border-t border-gray-100">
                <td className="px-5 py-4 font-medium text-gray-900">{name}</td>
                <td className="px-5 py-4">
                  {config[name] ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      {config[name]}
                    </span>
                  ) : (
                    <span className="text-gray-400">default (latest)</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right space-x-2">
                  <button
                    onClick={() => { setEditKey(name); setEditValue(config[name] || ""); }}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Set Version
                  </button>
                  {config[name] && (
                    <button
                      onClick={() => handleClear(name)}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Reset to Default
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MLAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>("health");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "health", label: "Model Health", icon: <Brain className="w-4 h-4" /> },
    { key: "stats", label: "Prediction Stats", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "config", label: "Model Config", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ML Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor model health, prediction statistics, and manage model version routing</p>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "health" && <HealthTab />}
      {activeTab === "stats" && <StatsTab />}
      {activeTab === "config" && <ConfigTab />}
    </motion.div>
  );
}
