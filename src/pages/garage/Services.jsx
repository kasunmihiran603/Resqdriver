import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Settings, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";

export const GarageServices = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  const handleOpenAdd = () => {
    setEditingService(null);
    reset({ name: "", price: "", desc: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setValue("name", srv.name);
    setValue("price", srv.price);
    setValue("desc", srv.desc);
    setIsOpen(true);
  };

  const onSubmit = (data) => {
    const list = currentUser.services ? [...currentUser.services] : [];

    if (editingService) {
      const idx = list.findIndex((s) => s.id === editingService.id);
      if (idx !== -1) {
        list[idx] = { id: editingService.id, ...data };
      }
      showToast("Service rate updated.", "success");
    } else {
      list.push({ id: `srv-${Date.now()}`, ...data });
      showToast("New service rate cataloged.", "success");
    }

    updateUserProfile({ services: list });
    setIsOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this service category from your catalog?")) {
      const list = currentUser.services.filter((s) => s.id !== id);
      updateUserProfile({ services: list });
      showToast("Service category deleted.", "info");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Service Catalog & Rates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure diagnostic categories and pricing packages.</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Catalog Rate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUser?.services?.length > 0 ? (
          currentUser.services.map((s) => (
            <Card key={s.id} className="border-border/80 relative flex flex-col justify-between">
              <CardContent className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm">{s.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">Catalog ID: {s.id}</p>
                  </div>
                  <span className="text-sm font-extrabold px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg shrink-0">
                    {s.price}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground/90 leading-relaxed">{s.desc}</p>
              </CardContent>

              <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Modify catalog item"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                  title="Remove catalog item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <Settings size={40} className="mx-auto text-muted-foreground/60 mb-3" />
            <h4 className="font-bold text-foreground">Empty Catalog List</h4>
            <p className="text-xs text-muted-foreground mt-1">Configure pricing to display offerings on the network.</p>
            <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-4">
              Add First Service Rate
            </Button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingService ? "Edit Service Rates" : "Catalog New Service offering"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Service Title / Category"
            placeholder="e.g. Engine Overheating, Tire Fix"
            error={!!errors.name}
            {...register("name", { required: "Service title is required" })}
          />
          <Input
            label="Base Rate / Price Range"
            placeholder="e.g. $80 - $120, Flat $50"
            error={!!errors.price}
            {...register("price", { required: "Price range is required" })}
          />
          <Textarea
            label="Service Description"
            placeholder="Describe what parts and diagnostic steps are included in this base rate..."
            error={!!errors.desc}
            {...register("desc", { required: "Description is required" })}
            rows={4}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingService ? "Save Changes" : "Add Catalog Rate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
