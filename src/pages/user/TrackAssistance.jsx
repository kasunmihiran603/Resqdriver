import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Timeline } from "../../components/ui/Timeline";
import { Navigation, Phone, Wrench, AlertTriangle, CheckCircle2, Truck, ChevronDown, ChevronUp, MapPin } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const NearbyGaragesMap = ({ userGps }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const uGps = userGps || { lat: 37.7749, lng: -122.4194 };

    const map = L.map(mapRef.current, { zoomControl: true }).setView([uGps.lat, uGps.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    // User breakdown location marker
    const userMarker = L.marker([uGps.lat, uGps.lng]).addTo(map);
    userMarker.bindPopup("<b>📍 Your Breakdown Location</b>").openPopup();

    // Fetch registered garages from localStorage and display markers for nearby partners
    try {
      const allUsers = JSON.parse(localStorage.getItem("vamp-users") || "[]");
      const garages = allUsers.filter((u) => u.role === "garage");

      garages.forEach((g) => {
        if (g.gps && g.gps.lat && g.gps.lng) {
          const gMarker = L.marker([g.gps.lat, g.gps.lng]).addTo(map);
          gMarker.bindPopup(`<b>🔧 ${g.name}</b><br/>${g.address || "Available Service Center"}<br/><span style="color:#10b981;font-weight:bold;">Active Broadcast Partner</span>`);
        }
      });
    } catch (e) {
      const gMarker = L.marker([37.7749, -122.4194]).addTo(map);
      gMarker.bindPopup("<b>🔧 Apex Auto Care</b><br/>Available Service Center");
    }

    const timer = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 250);

    leafletMap.current = map;

    return () => {
      clearTimeout(timer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [userGps]);

  return <div ref={mapRef} className="w-full h-56 rounded-xl border border-border overflow-hidden z-0 relative" />;
};

// ─── Timeline builders ───────────────────────────────────────────────────────

const getTowTimeline = (req) => {
  const timeline = [
    { title: "Tow Request Sent", description: "Broadcasting to nearby tow truck drivers.", time: "Just now", status: "completed" }
  ];
  if (req.status === "pending") {
    timeline.push({ title: "Driver Matching", description: "Finding an available tow truck near you", time: "In progress", status: "active" });
    timeline.push({ title: "Driver En Route", description: "Driver heading to your location", time: "--", status: "upcoming" });
    timeline.push({ title: "Vehicle Collected", description: "Your vehicle loaded and in transit", time: "--", status: "upcoming" });
  } else if (req.status === "accepted") {
    timeline.push({ title: "Driver Assigned", description: `${req.towingName || "Tow driver"} accepted your request`, time: "Just now", status: "completed" });
    timeline.push({ title: "Driver En Route", description: `ETA: ${req.eta}`, time: "In progress", status: "active" });
    timeline.push({ title: "Vehicle Collected", description: "Your vehicle loaded and in transit", time: "--", status: "upcoming" });
  } else if (req.status === "on_the_way") {
    timeline.push({ title: "Driver Assigned", description: `${req.towingName || "Tow driver"} is on the way`, time: "5m ago", status: "completed" });
    timeline.push({ title: "Driver Arriving", description: `ETA: ${req.eta}. Stand by at your location.`, time: "Just now", status: "active" });
    timeline.push({ title: "Vehicle Collected", description: "Your vehicle loaded and in transit", time: "--", status: "upcoming" });
  } else if (req.status === "repair_in_progress") {
    timeline.push({ title: "Driver Arrived", description: "Tow driver is on site.", time: "3m ago", status: "completed" });
    timeline.push({ title: "Vehicle Loading", description: "Securing vehicle onto flatbed.", time: "Just now", status: "active" });
    timeline.push({ title: "Delivered", description: req.destination || "Vehicle in transit to destination", time: "--", status: "upcoming" });
  }
  return timeline;
};

const getGarageTimeline = (req) => {
  const timeline = [
    { title: "Emergency Broadcasted", description: "Signal sent. Finding nearest garages.", time: "Just now", status: "completed" }
  ];
  if (req.status === "pending") {
    timeline.push({ title: "Garage Matching", description: "Checking mechanic workloads", time: "In progress", status: "active" });
    timeline.push({ title: "Technician Dispatched", description: "GPS mapping lock", time: "--", status: "upcoming" });
  } else if (req.status === "accepted") {
    timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "3m ago", status: "completed" });
    timeline.push({ title: "Cost Approval", description: "Awaiting your cost approval", time: "Just now", status: "active" });
    timeline.push({ title: "Technician Dispatched", description: "Assigning mechanic", time: "--", status: "upcoming" });
  } else if (req.status === "user_approved") {
    timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "5m ago", status: "completed" });
    timeline.push({ title: "Cost Approved", description: "You approved the estimated cost", time: "3m ago", status: "completed" });
    timeline.push({ title: "Technician Dispatched", description: "Garage is assigning mechanic", time: "In progress", status: "active" });
    timeline.push({ title: "Repair In Progress", description: "On-site diagnostic fix", time: "--", status: "upcoming" });
  } else if (req.status === "technician_assigned") {
    timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "10m ago", status: "completed" });
    timeline.push({ title: "Cost Approved", description: "You approved the estimated cost", time: "8m ago", status: "completed" });
    timeline.push({ title: "Technician Dispatched", description: `Mechanic ${req.technician.name} preparing toolkit`, time: "Just now", status: "completed" });
    timeline.push({ title: "On the Way", description: "Mechanic driving to you", time: "In progress", status: "active" });
    timeline.push({ title: "Repair In Progress", description: "On-site diagnostic fix", time: "--", status: "upcoming" });
  } else if (req.status === "on_the_way") {
    timeline.push({ title: "Cost Approved", description: "You approved the estimated cost", time: "10m ago", status: "completed" });
    timeline.push({ title: "Technician Dispatched", description: `Mechanic ${req.technician.name} dispatched`, time: "8m ago", status: "completed" });
    timeline.push({ title: "On the Way", description: `${req.technician?.name || "Mechanic"} driving to you. ETA: ${req.eta}`, time: "Just now", status: "active" });
    timeline.push({ title: "Repair Completed", description: "Incident resolved", time: "--", status: "upcoming" });
  } else if (req.status === "repair_in_progress") {
    timeline.push({ title: "Technician Arrived", description: `${req.technician?.name} arrived on site.`, time: "3m ago", status: "completed" });
    timeline.push({ title: "Repair Underway", description: "Active tool adjustments and part swap.", time: "Just now", status: "active" });
    timeline.push({ title: "Completed", description: "Payment ledger resolved", time: "--", status: "upcoming" });
  }
  return timeline;
};

// ─── Tow request card ────────────────────────────────────────────────────────

const TowTrackCard = ({ req, onCancel, focused }) => {
  const [open, setOpen] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    if (focused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focused]);

  return (
    <motion.div ref={cardRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Card header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-500/5 border rounded-2xl transition-all ${focused ? "border-amber-500/60 ring-2 ring-amber-500/30 shadow-amber-500/10 shadow-lg" : "border-amber-500/20"}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0 mt-0.5">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border border-amber-500/20">
              Live Tow Tracking
            </span>
            <h3 className="text-lg font-black text-foreground mt-1">{req.category} — Tow Request</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: {req.id} · {new Date(req.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {req.status !== "completed" && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(req.id)}>
              Cancel
            </Button>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Left: ETA + Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-extrabold tracking-wider text-amber-500">Tow Truck ETA</p>
                      <p className="text-3xl font-black text-foreground">{req.eta}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 animate-pulse">
                      <Truck size={26} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Tow Progression</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Timeline items={getTowTimeline(req)} />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Driver info + Route + Map */}
              <div className="space-y-4">
                {req.towingName && req.status !== "pending" ? (
                  <Card className="border-border/80 text-left">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Driver</CardTitle>
                      <h4 className="text-base font-bold text-foreground mt-0.5">{req.towingName}</h4>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-xl border flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                          <Truck size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground">{req.towingName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Tow Driver</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-2 border-t border-border/50 pt-3">
                        <div>
                          <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Pickup</p>
                          <p className="text-muted-foreground mt-0.5">{req.location}</p>
                        </div>
                        {req.destination && (
                          <div>
                            <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Drop-off</p>
                            <p className="text-muted-foreground mt-0.5">{req.destination}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-6 text-center space-y-2">
                      <Truck size={28} className="mx-auto text-amber-500/60 animate-bounce" />
                      <p className="font-bold text-foreground text-sm">Searching for Tow Truck</p>
                      <p className="text-xs text-muted-foreground">
                        Nearby drivers have been notified. One will accept shortly.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* GPS map widget */}
                <Card className="border-border/80 overflow-hidden h-44 relative flex flex-col justify-center items-center">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="relative flex items-center justify-center z-10">
                    <span className="absolute inline-flex h-16 w-16 rounded-full bg-amber-500/20 animate-ping opacity-60" />
                    <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-500/30 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-background">
                      <Truck size={14} />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-xs p-1.5 rounded-lg border border-border/60 text-[9px] font-bold text-center z-10">
                    Live Tow Dispatch Stream
                  </div>
                </Card>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Garage request card ─────────────────────────────────────────────────────

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const GarageTrackCard = ({ req, onCancel, onApproveCost, focused }) => {
  const [open, setOpen] = useState(true);
  const cardRef = useRef(null);
  const { formatAmount } = useCurrency();

  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(feeStr.replace(/[^0-9.]/g, "")) || 0;
  };

  useEffect(() => {
    if (focused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focused]);

  // Dynamic garage location lookup for exact accepted partner GPS
  const targetGarageGps = (() => {
    try {
      const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
      const found = users.find((u) => u.id === req.garageId || u.name === req.garageName);
      if (found && found.gps) return found.gps;
    } catch (e) {}
    return { lat: 37.7749, lng: -122.4194 };
  })();

  const distKm = req.gps && targetGarageGps ? calculateDistanceKm(targetGarageGps.lat, targetGarageGps.lng, req.gps.lat, req.gps.lng) : null;

  return (
    <motion.div ref={cardRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Card header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-rose-500/5 border rounded-2xl transition-all ${focused ? "border-rose-500/60 ring-2 ring-rose-500/30 shadow-rose-500/10 shadow-lg" : "border-rose-500/20"}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shrink-0 mt-0.5">
            <Wrench size={20} />
          </div>
          <div>
            <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border border-rose-500/20">
              Live Incident Tracking
            </span>
            <h3 className="text-lg font-black text-foreground mt-1">{req.category} Dispatch</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: {req.id} · {new Date(req.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!["repair_in_progress", "completed"].includes(req.status) && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(req.id)}>
              Cancel
            </Button>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Left: ETA + Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary">Estimated Time of Arrival</p>
                      <p className="text-3xl font-black text-foreground">{req.eta}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse">
                      <Navigation size={26} className="rotate-45" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Assistance Progression Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Timeline items={getGarageTimeline(req)} />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Garage info + Map */}
              <div className="space-y-4">
                {req.garageName ? (
                  <Card className="border-border/80 text-left">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Partner</CardTitle>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <h4 className="text-base font-bold text-foreground">{req.garageName}</h4>
                        {distKm && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold shrink-0">
                            📍 {distKm} km away
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {req.status === "accepted" && (
                        <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-muted-foreground">Estimated Cost:</span>
                            <span className="font-black text-primary text-sm">{formatAmount(parseFee(req.fee))}</span>
                          </div>
                          <Button
                            onClick={() => onApproveCost(req.id)}
                            className="w-full h-8 text-[11px] font-bold flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} /> Approve Cost & Dispatch
                          </Button>
                        </div>
                      )}

                      {req.status === "user_approved" && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-600">Cost Approved:</span>
                            <span className="font-black text-emerald-700 text-sm">{formatAmount(parseFee(req.fee))}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">Awaiting partner to dispatch technician.</p>
                        </div>
                      )}

                      {!["accepted", "user_approved"].includes(req.status) && (
                        <>
                          {req.technician ? (
                            <div className="p-3 bg-muted/50 rounded-xl border flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-xs">
                                {req.technician.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">{req.technician.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Technician</p>
                              </div>
                              <a
                                href={`tel:${req.technician.phone}`}
                                className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0"
                              >
                                <Phone size={14} />
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Garage is selecting best technician.</p>
                          )}
                        </>
                      )}

                      <div className="text-xs border-t border-border/50 pt-3">
                        <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Location</p>
                        <p className="text-muted-foreground mt-0.5">{req.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-border/85 bg-muted/10">
                    <CardContent className="p-6 text-center space-y-2">
                      <Wrench size={28} className="mx-auto text-muted-foreground/60 animate-spin" />
                      <p className="font-bold text-foreground text-sm">Searching Garages</p>
                      <p className="text-xs text-muted-foreground">
                        Broadcasted your GPS to nearby garages. Keep this page open.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Interactive GPS map widget showing user location and nearby available garages */}
                <Card className="border-border/80 overflow-hidden relative flex flex-col justify-center items-center">
                  <NearbyGaragesMap userGps={req.gps} />
                  <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-xs p-1.5 rounded-lg border border-border/60 text-[9px] font-bold text-center z-10 pointer-events-none shadow-sm">
                    📍 Live Dispatch Stream — Scanning Available Area Garages
                  </div>
                </Card>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

export const TrackAssistance = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const focusRequestId = location.state?.focusRequestId ?? null;

  const activeRequests = requests.filter(
    (r) => r.userId === currentUser?.id && r.status !== "completed"
  );

  const displayRequests = focusRequestId
    ? activeRequests.filter(r => r.id === focusRequestId)
    : activeRequests;

  const towRequests = displayRequests.filter(r => r.isTowingRequest === true);
  const garageRequests = displayRequests.filter(r => !r.isTowingRequest);

  const handleCancel = (id, isTow) => {
    const msg = isTow ? "Cancel this tow request?" : "Cancel this emergency assist request?";
    if (window.confirm(msg)) {
      updateRequestStatus(id, "completed", { eta: "Cancelled", fee: "$0.00" });
      showToast(isTow ? "Tow request cancelled." : "Emergency signal cancelled.", "info");
    }
  };

  const handleApproveCost = (id) => {
    updateRequestStatus(id, "user_approved", {
      eta: "Awaiting technician assignment..."
    });
    showToast("Estimated cost approved. The partner garage has been notified to assign a mechanic.", "success");
  };

  if (displayRequests.length === 0) {
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
          <h3 className="text-xl font-bold text-foreground">No Active Requests</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You have no ongoing emergency or tow requests right now.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Button onClick={() => navigate("/user/request")} className="flex items-center gap-2">
            <AlertTriangle size={16} /> Request Help
          </Button>
          <Button variant="outline" onClick={() => navigate("/user/tow-request")} className="flex items-center gap-2">
            <Truck size={16} /> Request a Tow
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Track Assistance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {focusRequestId
              ? "Showing selected request"
              : `${displayRequests.length} active request${displayRequests.length > 1 ? "s" : ""} in progress`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end items-center">
          {focusRequestId && activeRequests.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/user/track")}
              className="text-xs h-8"
            >
              View all ({activeRequests.length})
            </Button>
          )}
          {!focusRequestId && towRequests.length > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
              {towRequests.length} Tow{towRequests.length > 1 ? "s" : ""}
            </span>
          )}
          {!focusRequestId && garageRequests.length > 0 && (
            <span className="text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
              {garageRequests.length} Garage{garageRequests.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tow requests section */}
      {towRequests.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-foreground">Tow Truck Requests</h3>
            <span className="text-xs text-muted-foreground">({towRequests.length})</span>
            <div className="flex-1 h-px bg-amber-500/20 ml-2" />
          </div>
          {towRequests.map(req => (
            <TowTrackCard
              key={req.id}
              req={req}
              onCancel={(id) => handleCancel(id, true)}
              focused={focusRequestId === req.id}
            />
          ))}
        </section>
      )}

      {/* Divider if both exist */}
      {towRequests.length > 0 && garageRequests.length > 0 && (
        <div className="h-px bg-border" />
      )}

      {/* Garage requests section */}
      {garageRequests.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-rose-500" />
            <h3 className="text-base font-bold text-foreground">Garage / Mechanic Requests</h3>
            <span className="text-xs text-muted-foreground">({garageRequests.length})</span>
            <div className="flex-1 h-px bg-rose-500/20 ml-2" />
          </div>
          {garageRequests.map(req => (
            <GarageTrackCard
              key={req.id}
              req={req}
              onCancel={(id) => handleCancel(id, false)}
              onApproveCost={handleApproveCost}
              focused={focusRequestId === req.id}
            />
          ))}
        </section>
      )}
    </motion.div>
  );
};
