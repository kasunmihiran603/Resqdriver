import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Truck, Car, Wrench, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Register = () => {
  const { register: authRegister } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      // User fields
      make: "",
      model: "",
      plate: "",
      insurance: "",
      // Garage fields
      garageName: "",
      address: "",
      hours: "08:00 - 18:00",
      // Towing fields
      truckPlate: "",
      companyName: ""
    }
  });

  const watchEmail = watch("email");
  const watchName = watch("name");
  const watchPassword = watch("password");

  const handleNextStep = () => {
    // Basic step 1 validator
    if (!watchEmail || !watchName || !watchPassword || watchPassword.length < 6) {
      showToast("Please fill in name, email, and password (min 6 chars).", "error");
      return;
    }
    setStep(2);
  };

  const onSubmit = (data) => {
    setLoading(true);
    
    // Assemble final user object depending on role
    const finalDetails = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || "+1 (555) 000-0000",
      role: selectedRole
    };

    if (selectedRole === "user") {
      finalDetails.vehicles = [
        {
          id: `veh-${Date.now()}`,
          make: data.make || "Tesla",
          model: data.model || "Model 3",
          year: "2023",
          plate: data.plate || "MOCK-PLT",
          insurance: data.insurance || "Mock Insurance Co."
        }
      ];
    } else if (selectedRole === "garage") {
      finalDetails.name = data.garageName || data.name;
      finalDetails.ownerName = data.name;
      finalDetails.address = data.address || "100 Main St";
      finalDetails.hours = data.hours || "08:00 - 18:00";
      finalDetails.services = [
        { id: "srv-1", name: "Engine Issue", price: "$150", desc: "Standard Diagnostic Check" },
        { id: "srv-2", name: "Tire Issue", price: "$60", desc: "Flat tire repairs & replacement" }
      ];
      finalDetails.technicians = [
        { id: `tech-1`, name: "Bob Builder", phone: data.phone, status: "available" }
      ];
    } else if (selectedRole === "towing") {
      finalDetails.name = data.companyName || `${data.name} Towing`;
      finalDetails.operatorName = data.name;
      finalDetails.truckPlate = data.truckPlate || "TOW-MOCK";
      finalDetails.status = "available";
    }

    setTimeout(() => {
      const result = authRegister(finalDetails);
      setLoading(false);
      
      if (result.success) {
        showToast("Registration successful! Account generated.", "success");
        navigate(`/${selectedRole}/dashboard`);
      } else {
        showToast(result.message, "error");
      }
    }, 800);
  };

  const roles = [
    { id: "user", label: "Driver", icon: <Car size={20} />, desc: "Vehicle owner seeking assistance" },
    { id: "garage", label: "Garage", icon: <Wrench size={20} />, desc: "Auto repair shop provider" },
    { id: "towing", label: "Towing", icon: <Truck size={20} />, desc: "Tow truck & recovery operator" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl border-border bg-card">
          <CardHeader className="text-center pb-4 relative">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="absolute top-6 left-6 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-3 shadow-md">
              <Truck size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Create VAMP Account</CardTitle>
            <CardDescription>Step {step} of 2: {step === 1 ? "Credentials" : "Profile Details"}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={!!errors.name}
                      {...register("name", { required: "Full name is required" })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      error={!!errors.email}
                      {...register("email", { required: "Email address is required" })}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      error={!!errors.password}
                      {...register("password", { required: "Password is required", minLength: 6 })}
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+1 (555) 000-0000"
                      {...register("phone")}
                    />

                    {/* Role Selection Card Layout */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Select Your Account Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {roles.map((r) => {
                          const isSelected = selectedRole === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSelectedRole(r.id)}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                                  : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                              }`}
                            >
                              <div className="mb-2">{r.icon}</div>
                              <span className="text-xs font-bold">{r.label}</span>
                              <span className="text-[9px] mt-1 opacity-70 leading-tight hidden sm:block">{r.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button type="button" className="w-full flex items-center justify-center gap-2 mt-6" onClick={handleNextStep}>
                      Next Step <ArrowRight size={16} />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {/* Role Specific Fields */}
                    {selectedRole === "user" && (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Vehicle Details</p>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Vehicle Make"
                            placeholder="e.g. Toyota"
                            {...register("make", { required: selectedRole === "user" })}
                          />
                          <Input
                            label="Vehicle Model"
                            placeholder="e.g. Camry"
                            {...register("model", { required: selectedRole === "user" })}
                          />
                        </div>
                        <Input
                          label="License Plate Number"
                          placeholder="e.g. 7XYZ99"
                          {...register("plate", { required: selectedRole === "user" })}
                        />
                        <Input
                          label="Insurance Policy Details"
                          placeholder="e.g. State Farm - Policy #1234"
                          {...register("insurance")}
                        />
                      </div>
                    )}

                    {selectedRole === "garage" && (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Garage Details</p>
                        <Input
                          label="Garage Business Name"
                          placeholder="e.g. Auto Repair Shop"
                          {...register("garageName", { required: selectedRole === "garage" })}
                        />
                        <Input
                          label="Garage Address"
                          placeholder="e.g. 1028 Main Street"
                          {...register("address", { required: selectedRole === "garage" })}
                        />
                        <Input
                          label="Working Hours"
                          placeholder="e.g. 08:00 - 18:00"
                          {...register("hours")}
                        />
                      </div>
                    )}

                    {selectedRole === "towing" && (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Towing Details</p>
                        <Input
                          label="Towing Company Name"
                          placeholder="e.g. Road Recovery Services"
                          {...register("companyName", { required: selectedRole === "towing" })}
                        />
                        <Input
                          label="Tow Truck License Plate"
                          placeholder="e.g. TOW-9923"
                          {...register("truckPlate", { required: selectedRole === "towing" })}
                        />
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" loading={loading}>
                        Register
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
