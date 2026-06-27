import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  Car,
  AlertTriangle,
  Wrench,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Truck,
  History,
  Palette,
  Bell,
  Menu,
  X,
  Navigation,
  User,
  Edit3,
  ChevronUp
} from "lucide-react";

export const RoleLayout = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    showToast("Successfully logged out.", "success");
    navigate("/login");
  };

  // Define navigation items based on role
  const navigationItems = {
    user: [
      { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Request Help", path: "/user/request", icon: <AlertTriangle size={20} /> },
      { name: "Request a Tow", path: "/user/tow-request", icon: <Truck size={20} /> },
      { name: "Track Assistance", path: "/user/track", icon: <Navigation size={20} /> },
      { name: "My Vehicles", path: "/user/vehicles", icon: <Car size={20} /> }
    ],
    garage: [
      { name: "Dashboard", path: "/garage/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Request Queue", path: "/garage/requests", icon: <Wrench size={20} /> },
      { name: "Technicians", path: "/garage/technicians", icon: <Users size={20} /> },
      { name: "Our Services", path: "/garage/services", icon: <Settings size={20} /> },
      { name: "Service Records", path: "/garage/history", icon: <History size={20} /> },
      { name: "Garage Profile", path: "/garage/profile", icon: <Car size={20} /> }
    ],
    towing: [
      { name: "Dashboard", path: "/towing/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "My Tow Jobs", path: "/towing/jobs", icon: <Truck size={20} /> }
    ],
    admin: [
      { name: "Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "User Control", path: "/admin/users", icon: <Users size={20} /> },
      { name: "Global Logs", path: "/admin/services", icon: <History size={20} /> }
    ]
  };

  const items = navigationItems[currentUser?.role] || [];

  const accentColors = [
    { name: "blue", class: "bg-blue-600 border-blue-400" },
    { name: "green", class: "bg-emerald-600 border-emerald-400" },
    { name: "indigo", class: "bg-indigo-600 border-indigo-400" },
    { name: "rose", class: "bg-rose-600 border-rose-400" }
  ];

  const roleColors = {
    user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    garage: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    towing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    admin: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0 fixed top-0 bottom-0 left-0 z-20">
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-border/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Truck size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">VAMP</h1>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider -mt-1">Road Assistance</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              state={null}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-semibold transition-all select-none ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/60 relative">
          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { navigate(`/${currentUser?.role}/profile`); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold text-foreground hover:bg-muted w-full transition-colors cursor-pointer"
                    >
                      <User size={16} className="text-muted-foreground" /> View Profile
                    </button>
                    <button
                      onClick={() => { navigate(`/${currentUser?.role}/edit-profile`); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold text-foreground hover:bg-muted w-full transition-colors cursor-pointer"
                    >
                      <Edit3 size={16} className="text-muted-foreground" /> Edit Profile
                    </button>
                    <button
                      onClick={() => { navigate(`/${currentUser?.role}/settings`); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold text-foreground hover:bg-muted w-full transition-colors cursor-pointer"
                    >
                      <Settings size={16} className="text-muted-foreground" /> Settings
                    </button>
                  </div>
                  <div className="border-t border-border/60 p-1.5">
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold text-rose-500 hover:bg-rose-500/10 w-full transition-colors cursor-pointer"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 w-full transition-colors cursor-pointer"
          >
            {currentUser?.photo ? (
              <img src={currentUser.photo} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                {currentUser?.name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold truncate text-foreground">{currentUser?.name}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border mt-0.5 ${roleColors[currentUser?.role]}`}>
                {currentUser?.role}
              </span>
            </div>
            <ChevronUp size={14} className={`text-muted-foreground shrink-0 transition-transform ${showUserMenu ? "" : "rotate-180"}`} />
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* 2. TOP HEADER */}
        <header className="h-16 px-4 md:px-6 bg-card/85 backdrop-blur-md border-b border-border/60 flex items-center justify-between sticky top-0 z-30">
          {/* Left Brand on Mobile, Page Path on Desktop */}
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold capitalize text-foreground">
                {location.pathname.split("/").slice(1).join(" › ").replace(/-/g, " ")}
              </h2>
            </div>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-2">
            
            {/* Accent Color Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowAccentMenu(!showAccentMenu)}
                className="w-9 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
                title="Choose Accent Color"
              >
                <Palette size={18} />
              </button>
              <AnimatePresence>
                {showAccentMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAccentMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 p-2 bg-card border border-border rounded-xl shadow-xl z-20 flex gap-2"
                    >
                      {accentColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setAccentColor(color.name);
                            showToast(`Accent color changed to ${color.name}.`, "info");
                            setShowAccentMenu(false);
                          }}
                          className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${color.class} ${
                            accentColor === color.name ? "ring-2 ring-primary ring-offset-2 scale-105" : "opacity-80"
                          }`}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme selector */}
            <div className="flex border border-border bg-muted/40 rounded-lg p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${theme === "light" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Light Mode"
              >
                <Sun size={15} />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${theme === "dark" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Dark Mode"
              >
                <Moon size={15} />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${theme === "system" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="System Mode"
              >
                <Monitor size={15} />
              </button>
            </div>

            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden text-sm"
                    >
                      <div className="p-3 border-b border-border flex justify-between items-center bg-muted/10">
                        <span className="font-bold">Notifications</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">1 New</span>
                      </div>
                      <div className="divide-y divide-border/60 max-h-60 overflow-y-auto">
                        <div className="p-3 hover:bg-muted/30 transition-colors">
                          <p className="font-bold text-xs text-foreground">Welcome to VAMP Platform</p>
                          <p className="text-[11px] text-muted-foreground/90 mt-0.5">Explore emergency wizards, diagnostic tools, and dashboards built for you.</p>
                          <span className="text-[9px] text-muted-foreground mt-1 block">Just now</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown on Mobile */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs cursor-pointer select-none overflow-hidden border border-primary/20"
              >
                {currentUser?.photo ? (
                  <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.substring(0, 2).toUpperCase()
                )}
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-20 p-1.5 text-sm"
                    >
                      <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                        <p className="font-bold text-xs truncate">{currentUser?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{currentUser?.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { navigate(`/${currentUser?.role}/profile`); setShowProfileMenu(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-foreground hover:bg-muted cursor-pointer font-semibold transition-colors"
                        >
                          <User size={14} className="text-muted-foreground" /> View Profile
                        </button>
                        <button
                          onClick={() => { navigate(`/${currentUser?.role}/edit-profile`); setShowProfileMenu(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-foreground hover:bg-muted cursor-pointer font-semibold transition-colors"
                        >
                          <Edit3 size={14} className="text-muted-foreground" /> Edit Profile
                        </button>
                        <button
                          onClick={() => { navigate(`/${currentUser?.role}/settings`); setShowProfileMenu(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-foreground hover:bg-muted cursor-pointer font-semibold transition-colors"
                        >
                          <Settings size={14} className="text-muted-foreground" /> Settings
                        </button>
                      </div>
                      <div className="border-t border-border/60 mt-1 pt-1">
                        <button
                          onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer font-semibold transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* 3. MAIN PAGE CONTAINER */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="max-w-6xl mx-auto space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 4. MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around z-20 px-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            state={null}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold select-none transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <div className="mb-0.5">{item.icon}</div>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
    </div>
  );
};
