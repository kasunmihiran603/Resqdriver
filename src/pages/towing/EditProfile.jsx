import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { useForm } from "react-hook-form";

export const TowingEditProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(currentUser?.photo || "");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      operatorName: currentUser?.operatorName || "",
      truckPlate: currentUser?.truckPlate || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      hours: currentUser?.hours || "08:00 - 22:00",
      coverageRadius: currentUser?.coverageRadius || "20 miles"
    }
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      updateUserProfile({ ...data, photo });
      setLoading(false);
      showToast("Towing profile updated successfully.", "success");
      navigate("/towing/profile");
    }, 800);
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
          onClick={() => navigate("/towing/profile")}
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Update your towing company and operator information</p>
        </div>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt="Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-2xl border-2 border-amber-500/20">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-sm">Company / Operator Photo</p>
              <p className="text-xs text-muted-foreground mt-1">Click the camera icon to upload a new photo. Supports JPG, PNG.</p>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="text-xs text-destructive hover:underline mt-2 inline-block"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operator Info Form */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">Operator Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Towing Company Name"
                placeholder="e.g. Swift Tow Services"
                error={!!errors.name}
                {...register("name", { required: "Company name is required" })}
              />
              <Input
                label="Operator / Driver Name"
                placeholder="e.g. James Harlow"
                error={!!errors.operatorName}
                {...register("operatorName", { required: "Operator name is required" })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Truck Plate Number"
                placeholder="e.g. TW-4821"
                error={!!errors.truckPlate}
                {...register("truckPlate", { required: "Truck plate is required" })}
              />
              <Input
                label="Contact Phone Number"
                placeholder="e.g. +1 (555) 300-7700"
                error={!!errors.phone}
                {...register("phone", { required: "Phone number is required" })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Service Coverage Area"
                placeholder="e.g. 20 miles, Zone A"
                error={!!errors.coverageRadius}
                {...register("coverageRadius", { required: "Coverage area is required" })}
              />
              <Input
                label="Operating Hours"
                placeholder="e.g. 08:00 - 22:00 (Mon-Sun)"
                error={!!errors.hours}
                {...register("hours", { required: "Operating hours is required" })}
              />
            </div>

            <Input
              label="Base / Depot Address"
              placeholder="e.g. 47 Industrial Park Rd, Sector 3"
              error={!!errors.address}
              {...register("address", { required: "Depot address is required" })}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/towing/profile")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1 flex items-center justify-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
