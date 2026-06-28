import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../app/ProtectedRoute";
import { RoleLayout } from "../layout/RoleLayout";

// Auth Pages
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ForgotPassword } from "../pages/auth/ForgotPassword";

// User Pages
import { UserDashboard } from "../pages/user/Dashboard";
import { AssistanceWizard } from "../pages/user/AssistanceWizard";
import { TrackAssistance } from "../pages/user/TrackAssistance";
import { UserVehicles } from "../pages/user/Vehicles";
import { UserProfile } from "../pages/user/Profile";
import { EditProfile } from "../pages/user/EditProfile";
import { UserSettings } from "../pages/user/Settings";
import { UserTowingRequest } from "../pages/user/TowingRequest";
import { PaymentBilling } from "../pages/user/PaymentBilling";

// Garage Pages
import { GarageDashboard } from "../pages/garage/Dashboard";
import { GarageRequests } from "../pages/garage/Requests";
import { GarageTechnicians } from "../pages/garage/Technicians";
import { GarageServices } from "../pages/garage/Services";
import { GarageHistory } from "../pages/garage/History";
import { GarageProfile } from "../pages/garage/Profile";
import { GarageEditProfile } from "../pages/garage/EditProfile";
import { GarageSettings } from "../pages/garage/Settings";

// Towing Pages
import { TowingDashboard } from "../pages/towing/Dashboard";
import { TowingJobs } from "../pages/towing/Jobs";
import { TowingProfile } from "../pages/towing/Profile";
import { TowingEditProfile } from "../pages/towing/EditProfile";
import { TowingSettings } from "../pages/towing/Settings";

// Admin Pages
import { AdminDashboard } from "../pages/admin/Dashboard";
import { AdminUsers } from "../pages/admin/Users";
import { AdminServices } from "../pages/admin/Services";

// Root Redirect component
const RootRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const defaultRedirects = {
    user: "/user/dashboard",
    garage: "/garage/dashboard",
    towing: "/towing/dashboard",
    admin: "/admin/dashboard",
  };

  return <Navigate to={defaultRedirects[currentUser.role] || "/login"} replace />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Protected Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="request" element={<AssistanceWizard />} />
          <Route path="track" element={<TrackAssistance />} />
          <Route path="vehicles" element={<UserVehicles />} />
          <Route path="tow-request" element={<UserTowingRequest />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="payments" element={<PaymentBilling />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Garage Protected Routes */}
        <Route
          path="/garage"
          element={
            <ProtectedRoute allowedRoles={["garage"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<GarageDashboard />} />
          <Route path="requests" element={<GarageRequests />} />
          <Route path="technicians" element={<GarageTechnicians />} />
          <Route path="services" element={<GarageServices />} />
          <Route path="history" element={<GarageHistory />} />
          <Route path="profile" element={<GarageProfile />} />
          <Route path="edit-profile" element={<GarageEditProfile />} />
          <Route path="settings" element={<GarageSettings />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Towing Protected Routes */}
        <Route
          path="/towing"
          element={
            <ProtectedRoute allowedRoles={["towing"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TowingDashboard />} />
          <Route path="jobs" element={<TowingJobs />} />
          <Route path="profile" element={<TowingProfile />} />
          <Route path="edit-profile" element={<TowingEditProfile />} />
          <Route path="settings" element={<TowingSettings />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
