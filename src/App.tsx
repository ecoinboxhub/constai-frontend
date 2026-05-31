import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { ProjectTracker } from "./pages/MVPModules";
import DashboardOverview from "./pages/DashboardOverview";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import NotFoundPage from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";

const ProtectedRoute = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-slate-50/50">
        <Header />
        <div className="p-8 flex-1">
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
              path="settings"
              element={
                <PlaceholderPage
                  title="Integration Suite"
                  description="Manage API keys, webhooks, and enterprise system connections."
                  icon="settings"
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
