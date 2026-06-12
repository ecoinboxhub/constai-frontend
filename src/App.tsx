import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { ProjectTracker } from "./pages/MVPModules";
import DashboardOverview from "./pages/DashboardOverview";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import NotFoundPage from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import MLAdmin from "./pages/MLAdmin";
import SettingsPage from "./pages/SettingsPage";
import BlogPage from "./pages/BlogPage";
import NewsPage from "./pages/NewsPage";
import { useAuth } from "./components/auth-context";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header />
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="tracker" element={<ProjectTracker />} />
            <Route path="projects" element={<ProjectTracker />} />
            <Route
              path="cost"
              element={
                <PlaceholderPage
                  title="Cost Estimator"
                  description="Labor-burden aware budget forecasting with Naira pricing."
                  icon="cost"
                />
              }
            />
            <Route
              path="safety"
              element={
                <PlaceholderPage
                  title="Safety Hub"
                  description="Real-time hazard detection and safety compliance monitoring."
                  icon="safety"
                />
              }
            />
            <Route
              path="docs"
              element={<DocumentAnalyzer />}
            />
            <Route
              path="procurement"
              element={
                <PlaceholderPage
                  title="Procurement Assistant"
                  description="Supplier intelligence and materials price forecasting."
                  icon="procurement"
                />
              }
            />
            <Route
              path="workforce"
              element={
                <PlaceholderPage
                  title="Workforce Scheduler"
                  description="Shift optimization and idle rate reduction analytics."
                  icon="workforce"
                />
              }
            />
            <Route
              path="maintenance"
              element={
                <PlaceholderPage
                  title="Maintenance Predictor"
                  description="Equipment risk assessment and preventive schedules."
                  icon="maintenance"
                />
              }
            />
            <Route
              path="progress"
              element={
                <PlaceholderPage
                  title="Progress Vision"
                  description="Visual completion deviation analysis and site monitoring."
                  icon="progress"
                />
              }
            />
            <Route
              path="tender"
              element={
                <PlaceholderPage
                  title="Tender Analyzer"
                  description="Risk phrase extraction and bid competitiveness scoring."
                  icon="tender"
                />
              }
            />
            <Route
              path="ml-admin"
              element={<MLAdmin />}
            />
            <Route
              path="blog"
              element={<BlogPage />}
            />
            <Route
              path="news"
              element={<NewsPage />}
            />
            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
