import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Car, Phone, Mail, MapPin, Edit3, Shield } from "lucide-react";

export const UserProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your account information and registered vehicles</p>
        </div>
        <Button onClick={() => navigate("/user/edit-profile")} className="flex items-center gap-2">
          <Edit3 size={16} />
          Edit Profile
        </Button>
      </div>

      {/* Avatar + Identity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              {currentUser?.photo ? (
                <img
                  src={currentUser.photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/20">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-xl font-black text-foreground">{currentUser?.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {currentUser?.role}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <Shield size={9} /> Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground">User ID: {currentUser?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Mail size={16} />} label="Email Address" value={currentUser?.email || "Not provided"} />
          <InfoRow icon={<Phone size={16} />} label="Phone Number" value={currentUser?.phone || "Not provided"} />
          <InfoRow icon={<MapPin size={16} />} label="Home Address" value={currentUser?.address || "Not provided"} />
        </CardContent>
      </Card>

      {/* Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold">Registered Vehicles</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/user/vehicles")} className="text-primary text-xs p-1">
            Manage
          </Button>
        </CardHeader>
        <CardContent>
          {currentUser?.vehicles?.length > 0 ? (
            <div className="space-y-3">
              {currentUser.vehicles.map((v) => (
                <div key={v.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground shrink-0">
                    <Car size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{v.make} {v.model} ({v.year})</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mt-0.5">{v.plate}</p>
                    {v.insurance && (
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                        <Shield size={9} /> {v.insurance}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Car size={32} className="mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No vehicles registered yet.</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/user/vehicles")}>Add Vehicle</Button>
            </div>
          )}
        </CardContent>
      </Card>
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
