import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Truck, MapPin, Phone, Clock, ClipboardList, CheckCircle, Navigation, Eye } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const TowingDashboardRouteMap = ({ pickupGps, dropoffGps, pickupLabel, dropoffLabel }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const pGps = pickupGps || { lat: 37.7749, lng: -122.4194 };
    const dGps = dropoffGps || { lat: 37.7845, lng: -122.4012 };

    const map = L.map(mapRef.current, { zoomControl: true }).setView([pGps.lat, pGps.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const markerA = L.marker([pGps.lat, pGps.lng]).addTo(map);
    markerA.bindPopup(`<b>Pickup Location (A)</b><br/>${pickupLabel || ""}`).openPopup();

    const markerB = L.marker([dGps.lat, dGps.lng]).addTo(map);
    markerB.bindPopup(`<b>Dropoff Destination (B)</b><br/>${dropoffLabel || ""}`);

    try {
      const bounds = L.latLngBounds([pGps.lat, pGps.lng], [dGps.lat, dGps.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch (e) {
      // ignore
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
  }, [pickupGps, dropoffGps, pickupLabel, dropoffLabel]);

  return <div ref={mapRef} className="w-full h-64 rounded-xl border border-border overflow-hidden z-0 relative" />;
};

export const TowingDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mapModalRequest, setMapModalRequest] = useState(null);

  // Filter towing specific requests (category 'Accident' or explicitly assigned)
  const towingJobs = requests.filter((r) => r.towingId === currentUser.id);
  const unclaimedTows = requests.filter((r) => r.status === "pending" && !r.towingId && (r.isTowingRequest || r.category === "Accident"));
  const activeJob = towingJobs.find((r) => r.status !== "completed");
  const completedJobs = towingJobs.filter((r) => r.status === "completed");

  const totalEarnings = completedJobs.reduce((acc, curr) => {
    const numeric = parseFloat(curr.fee.replace(/[$,]/g, "")) || 0;
    return acc + (numeric * 0.9);
  }, 0);

  const handleAcceptJob = (reqId) => {
    if (activeJob) {
      showToast("Please complete your active tow job first.", "error");
      return;
    }
    updateRequestStatus(reqId, "accepted", {
      towingId: currentUser.id,
      towingName: currentUser.name,
      eta: "18 mins"
    });
    showToast("Towing job accepted! Navigating to live route map...", "success");
    navigate("/towing/jobs");
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{currentUser.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Logged in as {currentUser.operatorName} (Truck: <span className="text-primary font-bold">{currentUser.truckPlate}</span>)
          </p>
        </div>
        <Button onClick={() => navigate("/towing/jobs")} className="flex items-center gap-1">
          Open Live Tracker Grid <Truck size={16} />
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Active Recovery</span>
              <p className="text-2xl font-black text-foreground">{activeJob ? "1 Job" : "0 Jobs"}</p>
              <span className="text-[10px] text-blue-500 font-bold block">{activeJob ? "Active dispatch lock" : "Idle - looking for calls"}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Truck size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Completed Tows</span>
              <p className="text-2xl font-black text-foreground">{completedJobs.length}</p>
              <span className="text-[10px] text-emerald-500 font-bold block">Recoveries completed</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Dispatch Earnings</span>
              <p className="text-2xl font-black text-foreground">${totalEarnings.toFixed(2)}</p>
              <span className="text-[10px] text-primary font-bold block">After platform commission (10%)</span>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Truck size={22} className="stroke-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main active job highlight */}
      {activeJob && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            Active Tow Dispatch
          </h3>
          <Card className="border-rose-500/30 bg-rose-500/[0.01]">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/25 bg-blue-500/5 text-blue-500 uppercase">
                    {activeJob.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock size={12} /> ETA: {activeJob.eta}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground">{activeJob.category} — {activeJob.vehicle.make} {activeJob.vehicle.model}</h4>
                <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                  <MapPin size={13} className="text-rose-500" /> Pickup: {activeJob.location}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Navigation size={13} className="text-emerald-500" /> Destination: {activeJob.destination || "Apex Auto Care"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xl truncate">Note: {activeJob.description}</p>
              </div>
              
              <Button onClick={() => navigate("/towing/jobs")} size="sm" className="shrink-0">
                Open Controls & Route Map
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collision Jobs queue & history list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unclaimed board */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold">Collision Broadcast Board</CardTitle>
            <CardDescription>Nearby accidents awaiting flatbed dispatch</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {unclaimedTows.length > 0 ? (
              unclaimedTows.map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded">
                        Urgent Tow
                      </span>
                      <span className="text-[10px] text-muted-foreground">ID: {req.id}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">{req.vehicle.make} {req.vehicle.model}</h4>
                    <p className="text-xs text-foreground font-semibold">📍 Pickup: {req.location}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">🎯 Dropoff: {req.destination || "Nearest Repair Shop"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button onClick={() => setMapModalRequest(req)} size="sm" variant="outline" className="h-9 text-xs px-2.5">
                      <Eye size={12} className="mr-1" /> View Route Map
                    </Button>
                    <Button onClick={() => handleAcceptJob(req.id)} size="sm" className="h-9 text-xs px-3">
                      Accept Tow
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No unclaimed tow requests on network.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tow history list */}
        <Card className="border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold">Closed Recoveries</CardTitle>
            <CardDescription>My completed tow archives</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {completedJobs.length > 0 ? (
              completedJobs.map((req) => (
                <div key={req.id} className="p-4 space-y-2 hover:bg-muted/10 transition-colors text-left text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground">{req.userName}</p>
                      <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model}</p>
                    </div>
                    <span className="font-extrabold text-foreground">{req.fee}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">📍 {req.location}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No tow history cataloged yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* TOWING ROUTE MAP PREVIEW MODAL */}
      <Modal
        isOpen={!!mapModalRequest}
        onClose={() => setMapModalRequest(null)}
        title="Towing Recovery Route Preview"
        size="lg"
      >
        {mapModalRequest && (
          <div className="space-y-4 text-left">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-1">
              <p className="font-bold text-foreground">Client: {mapModalRequest.userName} ({mapModalRequest.userPhone})</p>
              <p className="text-muted-foreground">Vehicle: {mapModalRequest.vehicle.make} {mapModalRequest.vehicle.model} ({mapModalRequest.vehicle.plate})</p>
              <p className="text-rose-500 font-semibold">📍 Pickup (A): {mapModalRequest.location}</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">🎯 Dropoff (B): {mapModalRequest.destination || "Nearest Repair Shop"}</p>
            </div>

            <TowingDashboardRouteMap
              pickupGps={mapModalRequest.gps}
              dropoffGps={mapModalRequest.destinationGps}
              pickupLabel={mapModalRequest.location}
              dropoffLabel={mapModalRequest.destination || "Destination"}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setMapModalRequest(null)}>Close</Button>
              <Button onClick={() => {
                const reqId = mapModalRequest.id;
                setMapModalRequest(null);
                handleAcceptJob(reqId);
              }}>
                Accept Tow Contract
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
