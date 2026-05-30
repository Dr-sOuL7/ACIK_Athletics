import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { EmptyState } from "./components/ui/EmptyState";
import { AlertCircle } from "lucide-react";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AllTimeRecords = lazy(() => import("./pages/AllTimeRecords"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Achievements = lazy(() => import("./pages/Achievements"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EditHomepage = lazy(() => import("./pages/EditHomepage"));
const ManageRecords = lazy(() => import("./pages/ManageRecords"));
const ManageGallery = lazy(() => import("./pages/ManageGallery"));
const ManageAchievements = lazy(() => import("./pages/ManageAchievements"));

// A reusable loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1f1f1f',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1f1f1f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1f1f1f' },
            },
          }}
        />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/records" element={<MainLayout><AllTimeRecords /></MainLayout>} />
              <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
              <Route path="/achievements" element={<MainLayout><Achievements /></MainLayout>} />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
              <Route path="/admin/achievements" element={<AdminRoute><AdminLayout><ManageAchievements /></AdminLayout></AdminRoute>} />
              <Route path="/admin/homepage" element={<AdminRoute><AdminLayout><EditHomepage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/records" element={<AdminRoute><AdminLayout><ManageRecords /></AdminLayout></AdminRoute>} />
              <Route path="/admin/gallery" element={<AdminRoute><AdminLayout><ManageGallery /></AdminLayout></AdminRoute>} />

              <Route path="*" element={
                <MainLayout>
                  <div className="py-20 max-w-2xl mx-auto">
                    <EmptyState icon={AlertCircle} title="Page Not Found" description="The page you are looking for does not exist or has been moved." />
                  </div>
                </MainLayout>
              } />
            </Routes>
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}