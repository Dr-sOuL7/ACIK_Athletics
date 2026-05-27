import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Results from "./pages/Results";
import BestAthletes from "./pages/BestAthletes";
import Events from "./pages/Events";
import Rankings from "./pages/Rankings";
import Announcements from "./pages/Announcements";

import AdminDashboard from "./pages/AdminDashboard";
import EditHomepage from "./pages/EditHomepage";
import ManageAdmins from "./pages/ManageAdmins";
import ManageRankings from "./pages/ManageRankings";
import ManageEvents from "./pages/ManageEvents";

export default function App() {
  return (
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
          path="/results"
          element={
            <MainLayout>
              <Results />
            </MainLayout>
          }
        />

        <Route
          path="/best-athletes"
          element={
            <MainLayout>
              <BestAthletes />
            </MainLayout>
          }
        />

        <Route
          path="/events"
          element={
            <MainLayout>
              <Events />
            </MainLayout>
          }
        />

        <Route
          path="/rankings"
          element={
            <MainLayout>
              <Rankings />
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
          path="/admin/results"
          element={
            <AdminRoute>
              <AdminLayout>
                <Results />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageEvents />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/rankings"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageRankings />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/admins"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageAdmins />
              </AdminLayout>
            </AdminRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}