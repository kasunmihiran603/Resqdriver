import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Truck, ArrowLeft, MailCheck } from "lucide-react";
import { motion } from "framer-motion";

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      const result = forgotPassword(data.email);
      setLoading(false);
      
      if (result.success) {
        setSuccess(true);
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border bg-card">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-md">
              <Truck size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {!success ? "We'll send you instructions to reset your password" : "Instructions Sent"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!success ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
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
                
                <Button type="submit" className="w-full" loading={loading}>
                  Send Recovery Link
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <MailCheck size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed px-4">
                    If an account matches that email, we have dispatched instructions for securely resetting your password.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
