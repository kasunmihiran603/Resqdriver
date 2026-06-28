import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Truck, Phone, MapPin, Clock, Award, Edit3, Shield, Hash } from "lucide-react";

export const TowingProfile = () => {
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
          <h2 className="text-2xl font-black text-foreground">Towing Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your towing company information and operator details</p>
        </div>
        <Button onClick={() => navigate("/towing/edit-profile")} className="flex items-center gap-2">
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
                <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-2xl border-2 border-amber-500/20">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-xl font-black text-foreground">{currentUser?.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Towing
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <Shield size={9} /> Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground">ID: {currentUser?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operator Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Operator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Truck size={16} />} label="Operator / Driver Name" value={currentUser?.operatorName || "Not provided"} />
          <InfoRow icon={<Hash size={16} />} label="Truck Plate Number" value={currentUser?.truckPlate || "Not provided"} />
          <InfoRow icon={<Phone size={16} />} label="Contact Phone" value={currentUser?.phone || "Not provided"} />
          <InfoRow icon={<MapPin size={16} />} label="Base / Depot Address" value={currentUser?.address || "Not provided"} />
          <InfoRow icon={<Clock size={16} />} label="Operating Hours" value={currentUser?.hours || "Not provided"} />
          <InfoRow icon={<Award size={16} />} label="Service Coverage Area" value={currentUser?.coverageRadius || "Not provided"} />
        </CardContent>
      </Card>

      {/* Verified badge */}
      <div className="p-4 bg-amber-500/[0.03] border border-amber-500/20 rounded-xl flex items-start gap-3 text-xs">
        <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
          <Award size={15} />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-foreground">Verified Towing Operator</p>
          <p className="text-muted-foreground leading-relaxed">
            Your towing profile is fully verified. You receive real-time dispatch notifications for nearby collision and breakdown requests.
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
