import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import { EmptyState } from "./components/ui/EmptyState";
import { AlertCircle } from "lucide-react";

import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AllTimeRecords from "./pages/AllTimeRecords";
import Announcements from "./pages/Announcements";
import Gallery from "./pages/Gallery";

import AdminDashboard from "./pages/AdminDashboard";
import EditHomepage from "./pages/EditHomepage";
import ManageRecords from "./pages/ManageRecords";
import ManageGallery from "./pages/ManageGallery";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/records"
          element={
            <MainLayout>
              <AllTimeRecords />
            </MainLayout>
          }
        />

        <Route
          path="/announcements"
          element={
            <MainLayout>
              <Announcements />
            </MainLayout>
          }
        />

        <Route
          path="/gallery"
          element={
            <MainLayout>
              <Gallery />
            </MainLayout>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/homepage"
          element={
            <AdminRoute>
              <AdminLayout>
                <EditHomepage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/records"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageRecords />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/announcements"
          element={
            <AdminRoute>
              <AdminLayout>
                <Announcements />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/gallery"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageGallery />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route path="*" element={
          <MainLayout>
            <div className="py-20 max-w-2xl mx-auto">
              <EmptyState icon={AlertCircle} title="Page Not Found" description="The page you are looking for does not exist or has been moved." />
            </div>
          </MainLayout>
        } />
      </Routes>

    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
    </MotionConfig>
  );
}