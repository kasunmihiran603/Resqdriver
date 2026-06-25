import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Truck, MapPin, Phone, Clock, Navigation, Compass, AlertCircle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TowingJobs = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const towingJobs = requests.filter((r) => r.towingId === currentUser.id);
  const activeJob = towingJobs.find((r) => r.status !== "completed");
  const [customEta, setCustomEta] = useState("");

  const handleUpdateStatus = (status, msg) => {
    const fields = {};
    if (status === "on_the_way" && customEta) {
      fields.eta = customEta;
    }
    if (status === "completed") {
      fields.status = "completed";
      fields.eta = "Completed";
      // Auto assign garageId if not set, or finalize
      fields.garageId = "grg-1";
      fields.garageName = "Apex Auto Care";
    }
    updateRequestStatus(activeJob.id, status, fields);
    showToast(msg || `Tow status changed to ${status}`, "success");
    if (status === "completed") {
      navigate("/towing/dashboard");
    }
  };

  // Mock Map Route tracking values
  const [distanceSim, setDistanceSim] = useState(1.4);
  useEffect(() => {
    if (activeJob && activeJob.status === "on_the_way") {
      const interval = setInterval(() => {
        setDistanceSim((prev) => {
          if (prev <= 0.1) {
            clearInterval(interval);
            return 0.0;
          }
          return parseFloat((prev - 0.2).toFixed(1));
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeJob]);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Live Tow Operations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage active recovery coordinates and towing transit updates.</p>
      </div>

      {activeJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active controls and client details (Left side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Passenger client details */}
            <Card className="border-border/80 text-left">
              <CardHeader className="pb-3 border-b">
                <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider w-fit">
                  Active Dispatch Contract
                </span>
                <CardTitle className="text-base font-extrabold text-foreground mt-2">
                  Client: {activeJob.userName}
                </CardTitle>
                <CardDescription>
                  License Plate: <span className="font-extrabold text-foreground uppercase">{activeJob.vehicle.plate}</span> • {activeJob.vehicle.make} {activeJob.vehicle.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                
                {/* Locations list details */}
                <div className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 border-2 border-background flex items-center justify-center text-white text-[8px] font-bold">A</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Pickup Location</p>
                    <p className="font-bold text-foreground text-sm leading-relaxed">{activeJob.location}</p>
                  </div>
                  <div className="relative pt-2">
                    <span className="absolute -left-6 top-2.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[8px] font-bold">B</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Destination Dropoff</p>
                    <p className="font-bold text-foreground text-sm leading-relaxed">Apex Auto Care (1028 Industrial Blvd)</p>
                  </div>
                </div>

                {/* Symptom logs preview */}
                <div className="p-3 bg-muted/30 border rounded-xl">
                  <p className="font-bold text-muted-foreground text-[10px] uppercase">Incident Damage Report</p>
                  <p className="text-foreground leading-relaxed font-semibold italic mt-0.5">"{activeJob.description}"</p>
                </div>

                {/* Call buttons */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${activeJob.userPhone}`}
                    className="flex-1 h-11 border border-border hover:bg-muted text-foreground flex items-center justify-center gap-2 rounded-xl cursor-pointer font-semibold transition-colors"
                  >
                    <Phone size={15} /> Contact Client
                  </a>
                </div>

              </CardContent>
            </Card>

            {/* Stepper dispatch controls */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Driver Transit Tracker</CardTitle>
                <h3 className="text-base font-bold text-foreground mt-0.5">Report Recovery Progress</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Dynamic layout of step buttons */}
                <div className="grid grid-cols-2 gap-3">
                  
                  <Button
                    variant={activeJob.status === "accepted" ? "primary" : "outline"}
                    className="h-12 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => handleUpdateStatus("on_the_way", "En-route to client location.")}
                  >
                    On My Way
                  </Button>

                  <Button
                    variant={activeJob.status === "on_the_way" ? "primary" : "outline"}
                    className="h-12 text-xs flex items-center justify-center gap-1.5"
                    onClick={() => handleUpdateStatus("repair_in_progress", "Arrived at client site. Loading flatbed.")}
                  >
                    Arrived & Loading
                  </Button>

                  <Button
                    variant={activeJob.status === "repair_in_progress" ? "primary" : "outline"}
                    className="col-span-2 h-12 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                    onClick={() => handleUpdateStatus("completed", "Vehicle safely delivered. Towing log complete.")}
                  >
                    <Check size={16} className="stroke-[3]" /> Drop Off Complete
                  </Button>

                </div>

                {/* ETA editor if driving */}
                {activeJob.status === "on_the_way" && (
                  <div className="border-t border-border/50 pt-4 flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        label="Update Drive ETA"
                        placeholder="e.g. 10 mins, Arrived"
                        value={customEta}
                        onChange={(e) => setCustomEta(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => {
                      updateRequestStatus(activeJob.id, "on_the_way", { eta: customEta || "12 mins" });
                      showToast("Drive ETA updated.", "success");
                    }} className="h-11">
                      Update
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>

          </div>

          {/* Maps tracking interface (Right side) */}
          <div className="space-y-6">
            
            {/* Visual map route indicator */}
            <Card className="border-border/80 overflow-hidden h-72 relative flex flex-col justify-center items-center">
              <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/maps-bg.png')" }} />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Pulse and compass */}
              <div className="relative flex items-center justify-center z-10">
                <span className="absolute inline-flex h-24 w-24 rounded-full bg-rose-500/10 animate-ping opacity-60" />
                <span className="absolute inline-flex h-14 w-14 rounded-full bg-rose-500/20 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-background">
                  <Compass size={16} className="animate-spin-slow" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-xs p-2 rounded-lg border border-border/60 text-[10px] font-bold text-center z-10 space-y-0.5">
                <p className="text-foreground">GPS Route Navigation locking active</p>
                {activeJob.status === "on_the_way" && (
                  <p className="text-primary uppercase tracking-wider text-[8px] font-extrabold">
                    Distance to Pickup: {distanceSim} miles
                  </p>
                )}
              </div>
            </Card>

            {/* Incident diagnostic tags */}
            <Card className="border-border/80 text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnostics Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Incident Category</span>
                  <span className="font-bold text-foreground">{activeJob.category}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground font-semibold">Insurance Carrier</span>
                  <span className="font-bold text-foreground">{activeJob.vehicle.insurance || "None specified"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground font-semibold">Base Dispatch Cost</span>
                  <span className="font-bold text-foreground">{activeJob.fee}</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      ) : (
        <Card className="border-dashed border-border/80 bg-muted/20 py-16">
          <CardContent className="text-center space-y-3">
            <Truck size={48} className="mx-auto text-muted-foreground/60" />
            <h4 className="font-bold text-foreground text-base">No active towing contract</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are currently off-duty or idle. Please visit the dashboard queue to claim nearby accident recovery calls.
            </p>
            <Button onClick={() => navigate("/towing/dashboard")} variant="outline" size="sm" className="mt-4">
              Return to Broadcast Board
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
