import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Bell, Sun, Moon, Monitor, Palette, DollarSign, Trash2, UserX, Check } from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" }
];

const ACCENT_COLORS = [
  { name: "blue", class: "bg-blue-600", label: "Blue" },
  { name: "green", class: "bg-emerald-600", label: "Green" },
  { name: "indigo", class: "bg-indigo-600", label: "Indigo" },
  { name: "rose", class: "bg-rose-600", label: "Rose" }
];

export const GarageSettings = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    push: JSON.parse(localStorage.getItem("vamp-notif-push") ?? "true"),
    email: JSON.parse(localStorage.getItem("vamp-notif-email") ?? "true"),
    sms: JSON.parse(localStorage.getItem("vamp-notif-sms") ?? "false")
  });

  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();
  const [localCurrency, setLocalCurrency] = useState(globalCurrency);

  const toggleNotif = (key) => {
    const next = !notifications[key];
    const updated = { ...notifications, [key]: next };
    setNotifications(updated);
    localStorage.setItem(`vamp-notif-${key}`, JSON.stringify(next));
    showToast(
      `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${next ? "enabled" : "disabled"}.`,
      "info"
    );
  };

  const handleSaveCurrency = () => {
    setGlobalCurrency(localCurrency);
    showToast(`Currency display set to ${localCurrency} globally.`, "success");
  };

  const handleClearData = () => {
    if (window.confirm("Clear all local request, transaction, and notification data? This will reset all histories and cannot be undone.")) {
      localStorage.removeItem("vamp-requests");
      localStorage.removeItem("vamp-transactions");
      localStorage.removeItem("vamp-notifications");
      showToast("Local operational data cleared successfully. Re-seeding...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
      const updated = users.filter(u => u.id !== currentUser?.id);
      localStorage.setItem("vamp-users", JSON.stringify(updated));
      logout();
      navigate("/login");
      showToast("Your account has been deleted.", "info");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/garage/profile")}
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences and account options</p>
        </div>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell size={16} className="text-primary" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <ToggleRow
            label="Push Notifications"
            desc="In-app alerts for request status updates and dispatch events"
            checked={notifications.push}
            onChange={() => toggleNotif("push")}
          />
          <ToggleRow
            label="Email Notifications"
            desc="Email updates for dispatches, confirmations and receipts"
            checked={notifications.email}
            onChange={() => toggleNotif("email")}
          />
          <ToggleRow
            label="SMS Alerts"
            desc="Text message alerts for critical emergency updates"
            checked={notifications.sms}
            onChange={() => toggleNotif("sms")}
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Palette size={16} className="text-primary" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Theme Mode</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "light", label: "Light", icon: <Sun size={18} /> },
                { key: "dark", label: "Dark", icon: <Moon size={18} /> },
                { key: "system", label: "System", icon: <Monitor size={18} /> }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTheme(t.key);
                    showToast(`Theme set to ${t.label}.`, "info");
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                    theme === t.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {t.icon}
                  {t.label}
                  {theme === t.key && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Accent Color</p>
            <div className="flex gap-3 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    setAccentColor(c.name);
                    showToast(`Accent color set to ${c.label}.`, "info");
                  }}
                  title={c.label}
                  className={`relative w-11 h-11 rounded-full cursor-pointer transition-all hover:scale-110 ${c.class} ${
                    accentColor === c.name ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-lg" : "opacity-80"
                  }`}
                >
                  {accentColor === c.name && (
                    <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently: <span className="font-semibold text-foreground capitalize">{accentColor}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign size={16} className="text-primary" /> Currency Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">Choose the currency used for displaying fees and charges across the platform.</p>
          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setLocalCurrency(c.code)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  localCurrency === c.code
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/20 hover:bg-muted/40 hover:border-border/80"
                }`}
              >
                <span className={`text-xl font-black w-8 text-center leading-none ${
                  localCurrency === c.code ? "text-primary" : "text-muted-foreground"
                }`}>
                  {c.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${localCurrency === c.code ? "text-primary" : "text-foreground"}`}>{c.code}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.name}</p>
                </div>
                {localCurrency === c.code && <Check size={14} className="text-primary shrink-0" />}
              </button>
            ))}
          </div>
          <Button 
            className="w-full mt-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md cursor-pointer transition-colors"
            onClick={handleSaveCurrency}
            disabled={localCurrency === globalCurrency}
          >
            Save Currency
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
            <Trash2 size={16} /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div>
              <p className="text-sm font-bold text-foreground">Clear Local Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove all cached request history and session data from this device
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="shrink-0 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/60"
            >
              <Trash2 size={14} className="mr-1.5" /> Clear Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <div>
              <p className="text-sm font-bold text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              className="shrink-0"
            >
              <UserX size={14} className="mr-1.5" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
        checked ? "bg-primary" : "bg-muted border border-border"
      }`}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  </div>
);
