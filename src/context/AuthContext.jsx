import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Seed default users in localStorage if not present
const seedUsers = () => {
  const users = localStorage.getItem("vamp-users");
  if (!users) {
    const defaultUsers = [
      {
        id: "usr-1",
        email: "user@test.com",
        password: "password",
        role: "user",
        name: "Alex Mercer",
        phone: "+1 (555) 019-2834",
        vehicles: [
          { id: "veh-1", make: "Tesla", model: "Model S", year: "2022", plate: "E-DRIVE1", insurance: "State Farm - SF-982312" },
          { id: "veh-2", make: "Toyota", model: "RAV4", year: "2019", plate: "TR-8923A", insurance: "Geico - GC-10293" }
        ]
      },
      {
        id: "grg-1",
        email: "garage@test.com",
        password: "password",
        role: "garage",
        name: "Apex Auto Care",
        ownerName: "Marcus Vance",
        phone: "+1 (555) 018-9900",
        address: "1028 Industrial Blvd, Sector 7",
        hours: "08:00 - 20:00",
        coverageRadius: "15 miles",
        gps: { lat: 37.7749, lng: -122.4194 },
        services: [
          { id: "srv-1", name: "Engine Issue", price: "$120 - $500", desc: "Diagnostic, overheating fix, minor electrical and mechanical repair." },
          { id: "srv-2", name: "Tire Replacement/Fix", price: "$50 - $150", desc: "Flat tire repairs, spares replacement, and pressure calibration." },
          { id: "srv-3", name: "Battery Jumpstart & Replacement", price: "$60 - $220", desc: "Jumpstarting dead batteries or installation of a new heavy-duty battery." },
          { id: "srv-4", name: "Accident / Collision Recovery", price: "$200 - $800", desc: "Structural safety checks, minor cosmetic patching, roadworthiness evaluation." }
        ],
        technicians: [
          { id: "tech-1", name: "James R.", phone: "+1 (555) 018-9901", status: "available" },
          { id: "tech-2", name: "Sarah L.", phone: "+1 (555) 018-9902", status: "busy" },
          { id: "tech-3", name: "David K.", phone: "+1 (555) 018-9903", status: "available" }
        ]
      },
      {
        id: "tow-1",
        email: "towing@test.com",
        password: "password",
        role: "towing",
        name: "Rapid Towing & Recovery",
        operatorName: "Roy Jenkins",
        phone: "+1 (555) 017-4488",
        truckPlate: "TOW-FAST1",
        status: "available", // available, busy, offline
        address: "500 Logistics Way, Dock 4"
      },
      {
        id: "adm-1",
        email: "admin@test.com",
        password: "password",
        role: "admin",
        name: "Super Admin",
        phone: "+1 (555) 011-0000"
      }
    ];
    localStorage.setItem("vamp-users", JSON.stringify(defaultUsers));
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("vamp-current-user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    seedUsers();
  }, []);

  const login = (email, password, role) => {
    const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("vamp-current-user", JSON.stringify(foundUser));
      return { success: true };
    }
    return { success: false, message: "Invalid email, password, or role choice." };
  };

  const register = (details) => {
    const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
    
    // Check duplicate
    if (users.find((u) => u.email.toLowerCase() === details.email.toLowerCase())) {
      return { success: false, message: "Email is already registered." };
    }

    const newUser = {
      id: `${details.role.substring(0, 3)}-${Date.now()}`,
      ...details,
      vehicles: details.vehicles || [],
      technicians: details.technicians || [],
      services: details.services || []
    };

    users.push(newUser);
    localStorage.setItem("vamp-users", JSON.stringify(users));

    // Log the user in directly
    setCurrentUser(newUser);
    localStorage.setItem("vamp-current-user", JSON.stringify(newUser));

    return { success: true };
  };

  const updateUserProfile = (updatedDetails) => {
    const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index !== -1) {
      const updatedUser = { ...users[index], ...updatedDetails };
      users[index] = updatedUser;
      localStorage.setItem("vamp-users", JSON.stringify(users));
      setCurrentUser(updatedUser);
      localStorage.setItem("vamp-current-user", JSON.stringify(updatedUser));
      return { success: true };
    }
    return { success: false, message: "User not found." };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("vamp-current-user");
  };

  const forgotPassword = (email) => {
    const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      return { success: true, message: "Verification link sent to your email." };
    }
    return { success: false, message: "Email not found in our system." };
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, forgotPassword, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
