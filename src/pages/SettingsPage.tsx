import { useState } from "react";
import { motion } from "framer-motion";
import { Key, CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await api.post("/auth/change-password", { current_password: currentPassword, new_password: newPassword });
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-lg">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Key className="w-5 h-5" /> Change Password
        </h2>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 text-sm">Password changed successfully.</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
