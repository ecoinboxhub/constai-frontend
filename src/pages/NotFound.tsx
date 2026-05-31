import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">404</h1>
        <p className="text-lg text-slate-600 mb-8">
          The page you are looking for does not exist yet. Return to the dashboard or sign in again.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
