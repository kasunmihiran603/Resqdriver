import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Truck, Car, Wrench, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);

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
    // Simulate slight delay for luxury animations
    setTimeout(() => {
      const result = login(data.email, data.password, selectedRole);
      setLoading(false);
      
      if (result.success) {
        showToast(`Welcome back! Successfully logged in as ${selectedRole}.`, "success");
        navigate(`/${selectedRole}/dashboard`);
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
    { id: "user", label: "Driver", icon: <Car size={18} />, color: "border-blue-500/30 text-blue-500 bg-blue-500/5" },
    { id: "garage", label: "Garage", icon: <Wrench size={18} />, color: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" },
    { id: "towing", label: "Towing", icon: <Truck size={18} />, color: "border-amber-500/30 text-amber-500 bg-amber-500/5" },
    { id: "admin", label: "Admin", icon: <ShieldCheck size={18} />, color: "border-rose-500/30 text-rose-500 bg-rose-500/5" }
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
            
            {/* Quick Demo Pre-fill */}
            <div className="p-3 bg-muted/50 border border-border/80 rounded-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                Evaluation Panel (Click to pre-fill)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => prefill(r.id)}
                    className="flex items-center justify-center gap-1.5 p-2 bg-card hover:bg-muted border border-border rounded-lg font-bold text-foreground cursor-pointer transition-colors shadow-2xs"
                  >
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

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
    </div>
  );
};
