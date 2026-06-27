import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Timeline } from "../../components/ui/Timeline";
import { Navigation, Phone, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";

export const TrackAssistance = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const activeRequest = requests.find(
    (r) => r.userId === currentUser?.id && r.status !== "completed"
  );

  const getTimelineItems = (req) => {
    const timeline = [
      { title: "Emergency Broadcasted", description: "Signal sent. Finding nearest garages.", time: "Just now", status: "completed" }
    ];

    if (req.status === "pending") {
      timeline.push({ title: "Garage Matching", description: "Checking mechanic workloads", time: "In progress", status: "active" });
      timeline.push({ title: "Technician Dispatched", description: "GPS mapping lock", time: "--", status: "upcoming" });
    } else if (req.status === "accepted" || req.status === "technician_assigned") {
      timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "3m ago", status: "completed" });
      timeline.push({ title: "Technician Dispatched", description: req.technician ? `Mechanic ${req.technician.name} preparing toolkit` : "Assigning mechanic", time: "Just now", status: "active" });
      timeline.push({ title: "Repair In Progress", description: "On-site diagnostic fix", time: "--", status: "upcoming" });
    } else if (req.status === "on_the_way") {
      timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "5m ago", status: "completed" });
      timeline.push({ title: "On the Way", description: `${req.technician?.name || "Mechanic"} driving to your GPS location. ETA: ${req.eta}`, time: "Just now", status: "active" });
      timeline.push({ title: "Repair Completed", description: "Incident resolved", time: "--", status: "upcoming" });
    } else if (req.status === "repair_in_progress") {
      timeline.push({ title: "Technician Arrived", description: `${req.technician?.name} arrived on site.`, time: "3m ago", status: "completed" });
      timeline.push({ title: "Repair Underway", description: "Active tool adjustments and part swap.", time: "Just now", status: "active" });
      timeline.push({ title: "Completed", description: "Payment ledger resolved", time: "--", status: "upcoming" });
    }

    return timeline;
  };

  if (!activeRequest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <CheckCircle2 size={32} className="text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">No Active Assistance</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You don't have any ongoing emergency requests right now.
          </p>
        </div>
        <Button onClick={() => navigate("/user/request")} className="flex items-center gap-2">
          <AlertTriangle size={16} />
          Request Help Now
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border border-rose-500/20">
            Live Incident Tracking
          </span>
          <h2 className="text-2xl font-black text-foreground mt-1.5">{activeRequest.category} Dispatch</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            ID: {activeRequest.id} • Registered {new Date(activeRequest.timestamp).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${activeRequest.userPhone}`}
            className="w-10 h-10 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center rounded-xl cursor-pointer"
            title="Call Control Center"
          >
            <Phone size={18} />
          </a>
          {activeRequest.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm("Cancel this emergency assist request?")) {
                  updateRequestStatus(activeRequest.id, "completed", { eta: "Cancelled", fee: "$0.00" });
                  showToast("Emergency signal cancelled.", "info");
                  navigate("/user/dashboard");
                }
              }}
            >
              Cancel Help Call
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: ETA + Timeline */}
        <div className="lg:col-span-2 space-y-6">

          <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary">Estimated Time of Arrival</p>
                <p className="text-3xl font-black text-foreground">{activeRequest.eta}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse">
                <Navigation size={28} className="rotate-45" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-bold">Assistance Progression Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 text-left">
              <Timeline items={getTimelineItems(activeRequest)} />
            </CardContent>
          </Card>

        </div>

        {/* Right: Garage + GPS */}
        <div className="space-y-6">

          {activeRequest.garageName ? (
            <Card className="border-border/80 text-left">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assigned Partner</CardTitle>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{activeRequest.garageName}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeRequest.technician ? (
                  <div className="p-3.5 bg-muted/50 rounded-xl border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                      {activeRequest.technician.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{activeRequest.technician.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Technician</p>
                    </div>
                    <a
                      href={`tel:${activeRequest.technician.phone}`}
                      className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0 shadow-sm"
                      title="Call Technician"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">Garage is selecting best technician.</p>
                )}

                <div className="text-xs space-y-1 text-muted-foreground border-t border-border/50 pt-3">
                  <p className="font-bold text-foreground text-[11px]">Dispatched Location:</p>
                  <p className="leading-relaxed">{activeRequest.location}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/85 bg-muted/10">
              <CardContent className="p-8 text-center space-y-3">
                <Wrench size={32} className="mx-auto text-muted-foreground/60 animate-spin" />
                <h4 className="font-bold text-foreground text-sm">Searching Garages</h4>
                <p className="text-xs text-muted-foreground">
                  We have broadcasted your GPS coordinates to garages nearby. Keep this page open.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Live GPS map simulation */}
          <Card className="border-border/80 overflow-hidden h-60 relative flex flex-col justify-center items-center">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/maps-bg.png')" }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative flex items-center justify-center z-10">
              <span className="absolute inline-flex h-20 w-20 rounded-full bg-primary/20 animate-ping opacity-75" />
              <span className="absolute inline-flex h-12 w-12 rounded-full bg-primary/30 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background">
                <Navigation size={12} className="rotate-45" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-xs p-2 rounded-lg border border-border/60 text-[9px] font-bold text-center z-10">
              Live Dispatch Stream active
            </div>
          </Card>

        </div>
      </div>
    </motion.div>
  );
};
