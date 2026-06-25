import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Users, Plus, Trash2, Edit2, Phone, Award } from "lucide-react";
import { useForm } from "react-hook-form";

export const GarageTechnicians = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  const handleOpenAdd = () => {
    setEditingTech(null);
    reset({ name: "", phone: "", status: "available" });
    setIsOpen(true);
  };

  const handleOpenEdit = (tech) => {
    setEditingTech(tech);
    setValue("name", tech.name);
    setValue("phone", tech.phone);
    setValue("status", tech.status);
    setIsOpen(true);
  };

  const onSubmit = (data) => {
    const list = currentUser.technicians ? [...currentUser.technicians] : [];

    if (editingTech) {
      const idx = list.findIndex((t) => t.id === editingTech.id);
      if (idx !== -1) {
        list[idx] = { id: editingTech.id, ...data };
      }
      showToast("Technician profile updated.", "success");
    } else {
      list.push({ id: `tech-${Date.now()}`, ...data });
      showToast("New technician registered.", "success");
    }

    updateUserProfile({ technicians: list });
    setIsOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this technician? They will be unassigned from active jobs.")) {
      const list = currentUser.technicians.filter((t) => t.id !== id);
      updateUserProfile({ technicians: list });
      showToast("Technician profile deleted.", "info");
    }
  };

  const statusColors = {
    available: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    busy: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    offline: "bg-slate-500/10 text-slate-500 border-slate-500/20"
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Technician Scheduling</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage shop technicians and dispatcher status.</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Technician
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUser?.technicians?.length > 0 ? (
          currentUser.technicians.map((t) => (
            <Card key={t.id} className="border-border/80 relative overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base">
                      {t.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border mt-1 ${statusColors[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Edit technician details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                      title="Delete technician"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={13} />
                    <span className="font-semibold text-foreground">{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award size={13} />
                    <span className="font-semibold text-foreground">Verified Dispatch Operator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <Users size={40} className="mx-auto text-muted-foreground/60 mb-3" />
            <h4 className="font-bold text-foreground">No Registered Technicians</h4>
            <p className="text-xs text-muted-foreground mt-1">Add staff to begin scheduling dispatches.</p>
            <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-4">
              Add First Mechanic
            </Button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingTech ? "Edit Technician Details" : "Register New Technician"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Technician Full Name"
            placeholder="e.g. David Miller"
            error={!!errors.name}
            {...register("name", { required: "Name is required" })}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +1 (555) 019-9923"
            error={!!errors.phone}
            {...register("phone", { required: "Phone number is required" })}
          />
          <Select
            label="Status Availability"
            id="status-select"
            {...register("status")}
          >
            <option value="available">Available (Accepts dispatches)</option>
            <option value="busy">Busy (On field repair)</option>
            <option value="offline">Offline (Out of shift)</option>
          </Select>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTech ? "Save Changes" : "Register Staff"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
