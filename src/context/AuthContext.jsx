import React, { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("vamp-token");
      if (token) {
        try {
          const res = await api.get("/api/auth/me");
          if (res.data && res.data.user) {
            setCurrentUser(res.data.user);
          } else {
            localStorage.removeItem("vamp-token");
          }
        } catch (err) {
          localStorage.removeItem("vamp-token");
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post("/api/auth/login", { email, password, role });
      if (res.data && res.data.success) {
        const user = res.data.user;
        const token = res.data.token;
        localStorage.setItem("vamp-token", token);
        setCurrentUser(user);
        return { success: true, role: user.role };
      }
      return { success: false, message: "Login failed." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Invalid credentials." };
    }
  };

  const register = async (details) => {
    try {
      const res = await api.post("/api/auth/register", details);
      if (res.data && res.data.success) {
        const user = res.data.user;
        const token = res.data.token;
        localStorage.setItem("vamp-token", token);
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, message: "Registration failed." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed." };
    }
  };

  const updateUserProfile = async (updatedDetails) => {
    try {
      const res = await api.put("/api/auth/profile", updatedDetails);
      if (res.data && res.data.success) {
        const user = res.data.user;
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, message: "Profile update failed." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Profile update failed." };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setCurrentUser(null);
    localStorage.removeItem("vamp-token");
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      return { success: true, message: res.data?.message || "Verification link sent to your email." };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Email not found." };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, forgotPassword, updateUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};