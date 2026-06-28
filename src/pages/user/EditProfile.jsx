import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Camera, Save, Trash2, Plus } from "lucide-react";

export const EditProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    photo: currentUser?.photo || ""
  });

  const [vehicles, setVehicles] = useState(
    (currentUser?.vehicles || []).map(v => ({ ...v }))
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleChange("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const updateVehicle = (idx, field, value) => {
    setVehicles(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const addVehicle = () => {
    setVehicles(prev => [
      ...prev,
      { id: `veh-${Date.now()}`, make: "", model: "", year: "", plate: "", insurance: "" }
    ]);
  };

  const removeVehicle = (idx) => {
    setVehicles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }
    const invalidVehicle = vehicles.find(v => !v.make.trim() || !v.model.trim() || !v.plate.trim());
    if (invalidVehicle) {
      showToast("Fill in all required vehicle fields (make, model, plate).", "error");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateUserProfile({ ...form, vehicles });
      showToast("Profile updated successfully!", "success");
      setSaving(false);
      navigate("/user/profile");
    }, 400);
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
          onClick={() => navigate("/user/profile")}
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Update your personal information</p>
        </div>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/20">
                  {form.name?.substring(0, 2).toUpperCase() || "?"}
                </div>
              )}
              <button
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
              <p className="font-bold text-foreground text-sm">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-1">Click the camera icon to upload a new photo. Supports JPG, PNG.</p>
              {form.photo && (
                <button
                  onClick={() => handleChange("photo", "")}
                  className="text-xs text-destructive hover:underline mt-2 inline-block"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full Name *"
            id="name"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label="Phone Number"
            id="phone"
            value={form.phone}
            onChange={e => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <Input
            label="Home Address"
            id="address"
            value={form.address}
            onChange={e => handleChange("address", e.target.value)}
            placeholder="Street, City, Country"
          />
        </CardContent>
      </Card>

      {/* Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold">Vehicles</CardTitle>
          <Button variant="ghost" size="sm" onClick={addVehicle} className="text-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Add Vehicle
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No vehicles added.</p>
          )}
          {vehicles.map((v, idx) => (
            <div key={v.id} className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Vehicle {idx + 1}</p>
                <button
                  onClick={() => removeVehicle(idx)}
                  className="text-destructive hover:bg-destructive/10 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Make *"
                  value={v.make}
                  onChange={e => updateVehicle(idx, "make", e.target.value)}
                  placeholder="Toyota"
                />
                <Input
                  label="Model *"
                  value={v.model}
                  onChange={e => updateVehicle(idx, "model", e.target.value)}
                  placeholder="Camry"
                />
                <Input
                  label="Year"
                  value={v.year}
                  onChange={e => updateVehicle(idx, "year", e.target.value)}
                  placeholder="2022"
                />
                <Input
                  label="Plate *"
                  value={v.plate}
                  onChange={e => updateVehicle(idx, "plate", e.target.value)}
                  placeholder="ABC-1234"
                />
              </div>
              <Input
                label="Insurance"
                value={v.insurance}
                onChange={e => updateVehicle(idx, "insurance", e.target.value)}
                placeholder="Provider - Policy number"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button variant="outline" onClick={() => navigate("/user/profile")} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2">
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
};
