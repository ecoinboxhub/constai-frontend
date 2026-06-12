import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader2, HardHat, ArrowLeft, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/request-password-reset", { email });
      const token = response.data.token;
      setResetToken(token);
      setSent(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Failed to send reset request.";
      setError(typeof detail === "object" ? JSON.stringify(detail) : detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 flex items-center justify-center rounded-full mx-auto mb-4 shadow-lg">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              {sent
                ? "Use the token below to reset your password."
                : "Enter your email to receive a reset token."}
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Reset token generated</p>
                  <p className="text-green-700 text-sm mt-1">
                    Copy this token and go to the reset page:
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                <code className="text-sm text-gray-800 break-all select-all">{resetToken}</code>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="flex-1 text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Password
                </Link>
                <Link
                  to="/login"
                  className="flex-1 text-center bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Token"
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 flex-col justify-center p-16 text-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md"
        >
          <h2 className="text-4xl font-bold mb-6">Reset Your Password</h2>
          <p className="text-xl mb-8 text-blue-100">
            Enter your registered email address and we will send you a reset token to create a new password.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
