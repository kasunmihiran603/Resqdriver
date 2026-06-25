import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Save location or redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to respective default dashboard if they mismatch
    const defaultRedirects = {
      user: "/user/dashboard",
      garage: "/garage/dashboard",
      towing: "/towing/dashboard",
      admin: "/admin/dashboard",
    };
    
    return <Navigate to={defaultRedirects[currentUser.role] || "/login"} replace />;
  }

  return children;
};
