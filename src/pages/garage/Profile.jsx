import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Wrench, Phone, MapPin, Clock, Award, Edit3, Shield } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const GarageProfileMap = ({ gps, label }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const targetGps = gps || { lat: 37.7749, lng: -122.4194 };
    const map = L.map(mapRef.current, { zoomControl: true }).setView([targetGps.lat, targetGps.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const marker = L.marker([targetGps.lat, targetGps.lng]).addTo(map);
    marker.bindPopup(`<b>${label || "Garage Workshop"}</b>`).openPopup();
    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [gps, label]);

  return <div ref={mapRef} className="w-full h-52 rounded-xl border border-border overflow-hidden z-0 relative" />;
};

export const GarageProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Garage Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your business information and verified details</p>
        </div>
        <Button onClick={() => navigate("/garage/edit-profile")} className="flex items-center gap-2">
          <Edit3 size={15} />
          Edit Profile
        </Button>
      </div>

      {/* Avatar + Identity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0">
              {currentUser?.photo ? (
                <img
                  src={currentUser.photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-2xl border-2 border-emerald-500/20">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-xl font-black text-foreground">{currentUser?.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Garage
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <Shield size={9} /> Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground">ID: {currentUser?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Wrench size={16} />} label="Owner / Representative" value={currentUser?.ownerName || "Not provided"} />
          <InfoRow icon={<Phone size={16} />} label="Business Phone" value={currentUser?.phone || "Not provided"} />
          <InfoRow icon={<MapPin size={16} />} label="Workshop Address" value={currentUser?.address || "Not provided"} />

          {/* Workshop Location Map Preview */}
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
              <MapPin size={12} className="text-primary" /> Pinpoint Workshop Location (GPS)
            </p>
            <GarageProfileMap gps={currentUser?.gps} label={currentUser?.name} />
            <p className="text-[10px] text-muted-foreground font-mono">
              GPS Coordinates: LAT {currentUser?.gps?.lat?.toFixed(4) || "37.7749"}, LNG {currentUser?.gps?.lng?.toFixed(4) || "-122.4194"}
            </p>
          </div>

          <InfoRow icon={<Clock size={16} />} label="Business Hours" value={currentUser?.hours || "Not provided"} />
          <InfoRow icon={<Award size={16} />} label="Coverage Radius" value={currentUser?.coverageRadius || "Not provided"} />
          <InfoRow icon={<Award size={16} />} label="Rate Per KM" value={currentUser?.ratePerKM ? `LKR ${currentUser.ratePerKM}/km` : "Not provided"} />
        </CardContent>
      </Card>

      {/* Verified badge */}
      <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl flex items-start gap-3 text-xs">
        <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
          <Award size={15} />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-foreground">Verified Dispatcher Status</p>
          <p className="text-muted-foreground leading-relaxed">
            Your business profile is fully verified. Your technicians receive real-time notifications for nearby breakdowns.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3.5 bg-muted/20 rounded-xl border border-border/40">
    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5 break-words">{value}</p>
    </div>
  </div>
);
