import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Wrench, Clock, MapPin, Phone, ShieldAlert, Award } from "lucide-react";
import { useForm } from "react-hook-form";

export const GarageProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: currentUser.name || "",
      ownerName: currentUser.ownerName || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      hours: currentUser.hours || "08:00 - 20:00",
      coverageRadius: currentUser.coverageRadius || "15 miles"
    }
  });

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      updateUserProfile(data);
      setLoading(false);
      showToast("Garage business profile updated successfully.", "success");
    }, 800);
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Garage Business Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage operating parameters, service address, and coverage range.</p>
      </div>

      <Card className="border-border/80 relative overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Garage Business Name"
                placeholder="e.g. Apex Auto Care"
                error={!!errors.name}
                {...register("name", { required: "Business name is required" })}
              />
              <Input
                label="Owner / Representative Name"
                placeholder="e.g. Marcus Vance"
                error={!!errors.ownerName}
                {...register("ownerName", { required: "Owner name is required" })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Phone Number"
                placeholder="e.g. +1 (555) 018-9900"
                error={!!errors.phone}
                {...register("phone", { required: "Phone number is required" })}
              />
              <Input
                label="Coverage / Service Radius"
                placeholder="e.g. 15 miles, Sector 7"
                error={!!errors.coverageRadius}
                {...register("coverageRadius", { required: "Coverage radius is required" })}
              />
            </div>

            <Input
              label="Garage Workshop Address"
              placeholder="e.g. 1028 Industrial Blvd, Sector 7"
              error={!!errors.address}
              {...register("address", { required: "Workshop address is required" })}
            />

            <Input
              label="Business Hours"
              placeholder="e.g. 08:00 - 20:00 (Mon-Sun)"
              error={!!errors.hours}
              {...register("hours", { required: "Business hours is required" })}
            />

            {/* Verification highlights */}
            <div className="p-3 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl flex items-start gap-3 mt-4 text-xs">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                <Award size={15} />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-foreground">Verified Dispatcher Status</p>
                <p className="text-muted-foreground leading-relaxed">
                  Your business profile is fully checked. Your technicians will receive real-time notifications for nearby breakages.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={loading}>
                Save Profile Parameters
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};
