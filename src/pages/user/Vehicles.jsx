import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Car, Trash2, Edit2, Plus, Calendar, ShieldCheck, Tag } from "lucide-react";
import { useForm } from "react-hook-form";

export const UserVehicles = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    reset({ make: "", model: "", year: "", plate: "", insurance: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setValue("make", v.make);
    setValue("model", v.model);
    setValue("year", v.year);
    setValue("plate", v.plate);
    setValue("insurance", v.insurance);
    setIsOpen(true);
  };

  const onSubmit = (data) => {
    const list = currentUser.vehicles ? [...currentUser.vehicles] : [];

    if (editingVehicle) {
      // Modify
      const idx = list.findIndex((item) => item.id === editingVehicle.id);
      if (idx !== -1) {
        list[idx] = { id: editingVehicle.id, ...data };
      }
      showToast("Vehicle updated successfully.", "success");
    } else {
      // Create new
      list.push({ id: `veh-${Date.now()}`, ...data });
      showToast("Vehicle registered successfully.", "success");
    }

    updateUserProfile({ vehicles: list });
    setIsOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      const list = currentUser.vehicles.filter((v) => v.id !== id);
      updateUserProfile({ vehicles: list });
      showToast("Vehicle deleted.", "info");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">My Fleet Manager</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage cars, plate numbers, and policy records.</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUser?.vehicles?.length > 0 ? (
          currentUser.vehicles.map((v) => (
            <Card key={v.id} className="relative overflow-hidden border-border/80">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Car size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">{v.make} {v.model}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-extrabold tracking-wider border text-muted-foreground mt-1">
                        <Tag size={10} /> {v.plate}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Edit details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                      title="Delete vehicle"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Manufacture Year</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Calendar size={12} className="text-muted-foreground" /> {v.year}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Insurance Cover</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 truncate" title={v.insurance}>
                      <ShieldCheck size={12} className="text-muted-foreground" /> {v.insurance || "Not configured"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <Car size={40} className="mx-auto text-muted-foreground/60 mb-3" />
            <h4 className="font-bold text-foreground">No Registered Vehicles</h4>
            <p className="text-xs text-muted-foreground mt-1">Add a vehicle to enable faster emergency dispatch.</p>
            <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-4">
              Register First Vehicle
            </Button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingVehicle ? "Update Vehicle Record" : "Register New Vehicle"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vehicle Make"
              placeholder="e.g. Ford, Toyota"
              error={!!errors.make}
              {...register("make", { required: "Make is required" })}
            />
            <Input
              label="Vehicle Model"
              placeholder="e.g. F-150, Camry"
              error={!!errors.model}
              {...register("model", { required: "Model is required" })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Model Year"
              placeholder="e.g. 2020"
              error={!!errors.year}
              {...register("year", {
                required: "Year is required",
                pattern: { value: /^(19|20)\d{2}$/, message: "Invalid year" }
              })}
            />
            <Input
              label="License Plate"
              placeholder="e.g. 8ABC12"
              error={!!errors.plate}
              {...register("plate", { required: "License plate is required" })}
            />
          </div>
          <Input
            label="Insurance Company & Policy Details"
            placeholder="e.g. State Farm - Policy #00123"
            {...register("insurance")}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingVehicle ? "Save Changes" : "Register Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
