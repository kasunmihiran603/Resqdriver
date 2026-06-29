import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Save, Camera, MapPin, Compass } from "lucide-react";
import { useForm } from "react-hook-form";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const GarageLocationPickerMap = ({ gps, onGpsChange }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const initialGps = gps || { lat: 37.7749, lng: -122.4194 };

    const map = L.map(mapRef.current, { zoomControl: true }).setView([initialGps.lat, initialGps.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const marker = L.marker([initialGps.lat, initialGps.lng], { draggable: true }).addTo(map);
    marker.bindPopup("<b>Garage Workshop Location</b><br/>Drag or click map to update").openPopup();
    markerRef.current = marker;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onGpsChange({ lat, lng });
    });

    marker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      onGpsChange({ lat, lng });
    });

    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (leafletMap.current && gps) {
      if (markerRef.current) markerRef.current.setLatLng([gps.lat, gps.lng]);
      leafletMap.current.setView([gps.lat, gps.lng], 14, { animate: true });
    }
  }, [gps]);

  return <div ref={mapRef} className="w-full h-64 rounded-xl border border-border overflow-hidden z-0 relative" />;
};

export const GarageEditProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(currentUser?.photo || "");
  const [gps, setGps] = useState(currentUser?.gps || { lat: 37.7749, lng: -122.4194 });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      ownerName: currentUser?.ownerName || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      hours: currentUser?.hours || "08:00 - 20:00",
      coverageRadius: currentUser?.coverageRadius || "15 miles",
      ratePerKM: currentUser?.ratePerKM || 150
    }
  });

  const handleDetectLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGps(newGps);
          showToast("Detected live workshop coordinates!", "success");
        },
        () => {
          showToast("Could not detect GPS location.", "error");
        }
      );
    }
  };

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
      updateUserProfile({ ...data, photo, gps });
      setLoading(false);
      showToast("Garage profile updated successfully.", "success");
      navigate("/garage/profile");
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
          onClick={() => navigate("/garage/profile")}
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Update your garage business information</p>
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
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-2xl border-2 border-emerald-500/20">
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
              <p className="font-bold text-foreground text-sm">Garage Logo / Photo</p>
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

      {/* Business Info Form */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Input
                label="Rate Per KM (LKR)"
                type="number"
                placeholder="e.g. 150"
                error={!!errors.ratePerKM}
                {...register("ratePerKM", { required: "Rate per KM is required", valueAsNumber: true })}
              />
            </div>

            <Input
              label="Garage Workshop Address"
              placeholder="e.g. 1028 Industrial Blvd, Sector 7"
              error={!!errors.address}
              {...register("address", { required: "Workshop address is required" })}
            />

            {/* Workshop Location Map Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" /> Pin Workshop GPS Location on Map
                </label>
                <button
                  type="button"
                  onClick={handleDetectLiveLocation}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass size={14} /> Detect Current Location
                </button>
              </div>
              <GarageLocationPickerMap gps={gps} onGpsChange={setGps} />
              <p className="text-[10px] text-muted-foreground font-mono">
                Selected GPS: LAT {gps.lat.toFixed(4)}, LNG {gps.lng.toFixed(4)} (Used for accurate customer distance calculations)
              </p>
            </div>

            <Input
              label="Business Hours"
              placeholder="e.g. 08:00 - 20:00 (Mon-Sun)"
              error={!!errors.hours}
              {...register("hours", { required: "Business hours is required" })}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/garage/profile")}
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
