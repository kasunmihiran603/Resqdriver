import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Truck, Car, Wrench, ShieldAlert, ShieldCheck, Database, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [showEvaluatorPanel, setShowEvaluatorPanel] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: "user@test.com",
      password: "password"
    }
  });

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      const result = login(data.email, data.password);
      setLoading(false);
      
      if (result.success) {
        showToast(`Welcome back! Successfully logged in.`, "success");
        navigate(`/${result.role}/dashboard`);
      } else {
        showToast(result.message, "error");
      }
    }, 800);
  };

  const prefill = (role) => {
    setSelectedRole(role);
    setValue("email", `${role}@test.com`);
    setValue("password", "password");
    showToast(`Pre-filled login details for ${role}.`, "info");
  };

  const roles = [
    { id: "user", label: "Driver", icon: <Car size={16} />, color: "border-blue-500/20 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40" },
    { id: "garage", label: "Garage", icon: <Wrench size={16} />, color: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40" },
    { id: "towing", label: "Towing", icon: <Truck size={16} />, color: "border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative overflow-hidden">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border bg-card">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-md shadow-primary/20">
              <Truck size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Sign In to VAMP</CardTitle>
            <CardDescription>Vehicle Assistance & Emergency Management</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Email */}
              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full mt-2" loading={loading}>
                Sign In
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create account
              </Link>
            </div>
            
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating System Evaluator Portal */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showEvaluatorPanel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl w-80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-primary">
                  <Database size={15} />
                  <span className="text-xs font-black uppercase tracking-wider">Evaluation Portal</span>
                </div>
                <button
                  onClick={() => setShowEvaluatorPanel(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Click a role below to auto-fill mock credentials. Log in as <b>admin@test.com</b> for Admin settings.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      prefill(r.id);
                      setShowEvaluatorPanel(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 p-2 border rounded-xl font-bold cursor-pointer transition-all text-[9px] ${r.color}`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("email", "admin@test.com");
                  setValue("password", "password");
                  showToast("Pre-filled login details for Admin.", "info");
                  setShowEvaluatorPanel(false);
                }}
                className="w-full text-center py-1.5 border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl font-bold text-[9px] cursor-pointer"
              >
                ⚙️ Quick-Fill Super Admin
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowEvaluatorPanel(!showEvaluatorPanel)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
        >
          <Database size={12} />
          Evaluator Mode
        </button>
      </div>
    </div>
  );
};
