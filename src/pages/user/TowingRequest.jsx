import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Truck, AlertTriangle, Car, MapPin, FileText, CheckCircle,
  ChevronRight, ChevronLeft, Wrench, Zap, Waves, ParkingCircle,
  HelpCircle, ArrowRight, Plus, Compass
} from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const INCIDENT_TYPES = [
  { id: "Accident", label: "Accident / Collision", icon: <AlertTriangle size={22} />, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30", desc: "Vehicle involved in a collision or crash" },
  { id: "Breakdown", label: "Mechanical Breakdown", icon: <Wrench size={22} />, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", desc: "Engine failure, flat tyre, or mechanical fault" },
  { id: "Battery", label: "Dead Battery / Electrical", icon: <Zap size={22} />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30", desc: "Vehicle won't start, electrical fault" },
  { id: "Flood", label: "Flood / Water Damage", icon: <Waves size={22} />, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30", desc: "Vehicle stranded in water or flood damage" },
  { id: "Parking", label: "Illegal Parking / Retrieval", icon: <ParkingCircle size={22} />, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", desc: "Vehicle needs to be retrieved or relocated" },
  { id: "Other", label: "Other", icon: <HelpCircle size={22} />, color: "text-muted-foreground", bg: "bg-muted/20 border-border/60", desc: "Any other towing situation" }
];

const STEPS = [
  { number: 1, label: "Incident" },
  { number: 2, label: "Vehicle" },
  { number: 3, label: "Locations" },
  { number: 4, label: "Notes" },
  { number: 5, label: "Review" }
];

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 })
};

const EMPTY_VEHICLE = { make: "", model: "", year: "", plate: "", insurance: "" };

const InteractiveDualMap = ({ pickupGps, dropoffGps, onPickupChange, onDropoffChange, activeTab }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([pickupGps.lat, pickupGps.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const pickupMarker = L.marker([pickupGps.lat, pickupGps.lng], { draggable: true }).addTo(map);
    pickupMarker.bindPopup("<b>Pickup Location (A)</b>");
    pickupMarkerRef.current = pickupMarker;

    const dropoffMarker = L.marker([dropoffGps.lat, dropoffGps.lng], { draggable: true }).addTo(map);
    dropoffMarker.bindPopup("<b>Dropoff Destination (B)</b>");
    dropoffMarkerRef.current = dropoffMarker;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (activeTab === "pickup") {
        pickupMarker.setLatLng([lat, lng]);
        onPickupChange({ lat, lng });
      } else {
        dropoffMarker.setLatLng([lat, lng]);
        onDropoffChange({ lat, lng });
      }
    });

    pickupMarker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      onPickupChange({ lat, lng });
    });

    dropoffMarker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      onDropoffChange({ lat, lng });
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
    if (leafletMap.current) {
      if (pickupMarkerRef.current) pickupMarkerRef.current.setLatLng([pickupGps.lat, pickupGps.lng]);
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.setLatLng([dropoffGps.lat, dropoffGps.lng]);
      const targetGps = activeTab === "pickup" ? pickupGps : dropoffGps;
      leafletMap.current.setView([targetGps.lat, targetGps.lng], 14, { animate: true });
    }
  }, [pickupGps, dropoffGps, activeTab]);

  return <div ref={mapRef} className="w-full h-64 rounded-xl border border-border overflow-hidden z-0 relative" />;
};

export const UserTowingRequest = () => {
  const { currentUser } = useAuth();
  const { createRequest } = useRequests();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const savedVehicles = currentUser?.vehicles || [];

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [incidentType, setIncidentType] = useState("");

  // Vehicle selection: "saved-N" (index into savedVehicles) or "manual"
  const [vehicleChoice, setVehicleChoice] = useState(savedVehicles.length > 0 ? "saved-0" : "manual");
  const [manualVehicle, setManualVehicle] = useState({ ...EMPTY_VEHICLE });

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const [pickupGps, setPickupGps] = useState({ lat: 37.7749, lng: -122.4194 });
  const [dropoffGps, setDropoffGps] = useState({ lat: 37.7779, lng: -122.4164 });
  const [activeMapTab, setActiveMapTab] = useState("pickup"); // "pickup" or "dropoff"

  const [notes, setNotes] = useState("");

  const handlePickupChange = (newGps) => {
    setPickupGps(newGps);
    // Auto-position destination marker nearby in the same neighborhood
    setDropoffGps({ lat: newGps.lat + 0.003, lng: newGps.lng + 0.003 });
  };

  const handleGetLivePickup = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPickup = { lat, lng };
          setPickupGps(newPickup);
          setDropoffGps({ lat: lat + 0.003, lng: lng + 0.003 });
          setActiveMapTab("pickup");
          showToast("Acquired live pickup location!", "success");
        },
        () => {
          showToast("Could not get live location. Enable location permissions.", "error");
        }
      );
    }
  };

  const go = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const getSelectedVehicle = () => {
    if (vehicleChoice === "manual") return manualVehicle;
    const idx = parseInt(vehicleChoice.replace("saved-", ""), 10);
    return savedVehicles[idx] || manualVehicle;
  };

  const canProceed = () => {
    if (step === 1) return !!incidentType;
    if (step === 2) {
      const v = getSelectedVehicle();
      return !!(v.make?.trim() && v.model?.trim() && v.plate?.trim());
    }
    if (step === 3) return true; // Locations step always proceedable via GPS
    return true;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const v = getSelectedVehicle();

    const finalPickup = pickup.trim()
      ? pickup.trim()
      : `GPS Pickup (${pickupGps.lat.toFixed(4)}, ${pickupGps.lng.toFixed(4)})`;

    const finalDropoff = dropoff.trim()
      ? dropoff.trim()
      : `GPS Dropoff (${dropoffGps.lat.toFixed(4)}, ${dropoffGps.lng.toFixed(4)})`;

    setTimeout(() => {
      createRequest({
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone || "",
        vehicle: { make: v.make, model: v.model, year: v.year || "", plate: v.plate, insurance: v.insurance || "" },
        category: incidentType,
        isTowingRequest: true,
        description: notes || "No additional notes.",
        location: finalPickup,
        destination: finalDropoff,
        gps: pickupGps,
        destinationGps: dropoffGps,
        status: "pending",
        towingId: null,
        garageId: null,
        eta: "Searching for tow truck...",
        fee: "$180.00"
      });
      showToast("Towing request submitted! A driver will be assigned shortly.", "success");
      setSubmitting(false);
      navigate("/user/track");
    }, 700);
  };

  const selectedVehicle = getSelectedVehicle();
  const selectedIncident = INCIDENT_TYPES.find(t => t.id === incidentType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-foreground">Request a Tow</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Get a tow truck dispatched to your location</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const done = step > s.number;
          const active = step === s.number;
          return (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  done ? "bg-primary border-primary text-primary-foreground"
                  : active ? "bg-card border-primary text-primary shadow-sm shadow-primary/20"
                  : "bg-card border-border text-muted-foreground"
                }`}>
                  {done ? <CheckCircle size={16} className="stroke-[2.5]" /> : s.number}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${step > s.number ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >

            {/* ── STEP 1: Incident Type ── */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <AlertTriangle size={16} className="text-primary" /> Why do you need a tow?
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {INCIDENT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setIncidentType(t.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        incidentType === t.id
                          ? `${t.bg} ring-2 ring-primary`
                          : "border-border bg-muted/10 hover:bg-muted/30"
                      }`}
                    >
                      <div className={`shrink-0 ${incidentType === t.id ? t.color : "text-muted-foreground"}`}>
                        {t.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">{t.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── STEP 2: Vehicle ── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Saved vehicles */}
                {savedVehicles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Car size={16} className="text-primary" /> Select your vehicle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {savedVehicles.map((v, idx) => (
                        <button
                          key={v.id || idx}
                          onClick={() => setVehicleChoice(`saved-${idx}`)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            vehicleChoice === `saved-${idx}`
                              ? "border-primary bg-primary/5 ring-2 ring-primary"
                              : "border-border bg-muted/10 hover:bg-muted/30"
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            vehicleChoice === `saved-${idx}` ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border text-muted-foreground"
                          }`}>
                            <Car size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-sm">{v.make} {v.model} {v.year && `(${v.year})`}</p>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mt-0.5">{v.plate}</p>
                            {v.insurance && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{v.insurance}</p>}
                          </div>
                          {vehicleChoice === `saved-${idx}` && (
                            <CheckCircle size={18} className="text-primary shrink-0" />
                          )}
                        </button>
                      ))}

                      <button
                        onClick={() => setVehicleChoice("manual")}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          vehicleChoice === "manual"
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-dashed border-border bg-muted/5 hover:bg-muted/20"
                        }`}
                      >
                        <div className="p-2.5 rounded-xl border bg-card border-border text-muted-foreground shrink-0">
                          <Plus size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Enter vehicle manually</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Different vehicle or not registered</p>
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                )}

                {/* Manual vehicle form */}
                {(vehicleChoice === "manual" || savedVehicles.length === 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-bold">
                        {savedVehicles.length === 0 ? "Vehicle details" : "Enter vehicle details"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Make *"
                          value={manualVehicle.make}
                          onChange={e => setManualVehicle(p => ({ ...p, make: e.target.value }))}
                          placeholder="Toyota"
                        />
                        <Input
                          label="Model *"
                          value={manualVehicle.model}
                          onChange={e => setManualVehicle(p => ({ ...p, model: e.target.value }))}
                          placeholder="Camry"
                        />
                        <Input
                          label="Year"
                          value={manualVehicle.year}
                          onChange={e => setManualVehicle(p => ({ ...p, year: e.target.value }))}
                          placeholder="2020"
                        />
                        <Input
                          label="License Plate *"
                          value={manualVehicle.plate}
                          onChange={e => setManualVehicle(p => ({ ...p, plate: e.target.value.toUpperCase() }))}
                          placeholder="ABC-1234"
                        />
                      </div>
                      <Input
                        label="Insurance"
                        value={manualVehicle.insurance}
                        onChange={e => setManualVehicle(p => ({ ...p, insurance: e.target.value }))}
                        placeholder="Provider - Policy #"
                      />
                      <p className="text-xs text-muted-foreground">* Required fields</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ── STEP 3: Locations ── */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin size={16} className="text-primary" /> Pickup & Drop-off
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="relative pl-8 space-y-4">
                    <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />
                    <div className="relative">
                      <span className="absolute -left-8 top-0.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-background flex items-center justify-center text-white text-[9px] font-black">A</span>
                      <Input
                        label="Your current location (pickup) (Optional manual description)"
                        value={pickup}
                        onChange={e => setPickup(e.target.value)}
                        placeholder={`e.g. Exit 44 or GPS (${pickupGps.lat.toFixed(4)}, ${pickupGps.lng.toFixed(4)})`}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[9px] font-black">B</span>
                      <Input
                        label="Tow destination (Optional manual description)"
                        value={dropoff}
                        onChange={e => setDropoff(e.target.value)}
                        placeholder={`e.g. Apex Garage or GPS (${dropoffGps.lat.toFixed(4)}, ${dropoffGps.lng.toFixed(4)})`}
                      />
                    </div>
                  </div>

                  {/* Interactive Map Selector */}
                  <div className="space-y-2 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setActiveMapTab("pickup")}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${activeMapTab === "pickup" ? "bg-rose-500 text-white border-rose-500 font-extrabold" : "bg-card border-border text-muted-foreground hover:bg-muted/40"}`}
                        >
                          📍 Set Pickup (Pin A)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMapTab("dropoff")}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${activeMapTab === "dropoff" ? "bg-emerald-600 text-white border-emerald-600 font-extrabold" : "bg-card border-border text-muted-foreground hover:bg-muted/40"}`}
                        >
                          🎯 Set Destination (Pin B)
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLivePickup}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Compass size={14} /> Detect Live Location
                      </button>
                    </div>

                    <InteractiveDualMap
                      pickupGps={pickupGps}
                      dropoffGps={dropoffGps}
                      onPickupChange={handlePickupChange}
                      onDropoffChange={setDropoffGps}
                      activeTab={activeMapTab}
                    />
                    <div className="text-[10px] text-muted-foreground flex justify-between px-1 font-mono">
                      <span>A (Pickup): {pickupGps.lat.toFixed(4)}, {pickupGps.lng.toFixed(4)}</span>
                      <span>B (Destination): {dropoffGps.lat.toFixed(4)}, {dropoffGps.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-xl text-xs">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Route Coordinates Confirmed</p>
                      <p className="text-muted-foreground mt-0.5">
                        {pickup || `GPS A`} <ArrowRight size={10} className="inline mx-1" /> {dropoff || `GPS B`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── STEP 4: Notes ── */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText size={16} className="text-primary" /> Additional Information
                    <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Help the tow truck driver by providing any extra details about your situation.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wide block">
                      Notes for the driver
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Car is on the right side of the road, hazard lights are on. Keys are inside. There's a broken bumper..."
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition"
                    />
                  </div>
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-600 font-semibold">
                    Make sure you are in a safe location. If you are in immediate danger, call emergency services first.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── STEP 5: Review ── */}
            {step === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileText size={16} className="text-primary" /> Confirm your request
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <ReviewSection title="Incident">
                      <ReviewRow label="Type" value={selectedIncident?.label || incidentType} />
                    </ReviewSection>

                    <ReviewSection title="Vehicle">
                      <ReviewRow
                        label="Vehicle"
                        value={`${selectedVehicle.make} ${selectedVehicle.model}${selectedVehicle.year ? ` (${selectedVehicle.year})` : ""}`}
                      />
                      <ReviewRow label="Plate" value={<span className="font-black uppercase">{selectedVehicle.plate}</span>} />
                      {selectedVehicle.insurance && <ReviewRow label="Insurance" value={selectedVehicle.insurance} />}
                    </ReviewSection>

                    <ReviewSection title="Route">
                      <ReviewRow label="Pickup" value={pickup} />
                      <ReviewRow label="Drop-off" value={dropoff} />
                    </ReviewSection>

                    <ReviewSection title="Your details">
                      <ReviewRow label="Name" value={currentUser?.name} />
                      <ReviewRow label="Phone" value={currentUser?.phone || "Not provided"} />
                    </ReviewSection>

                    {notes && (
                      <ReviewSection title="Notes">
                        <p className="text-xs text-foreground font-semibold italic leading-relaxed">"{notes}"</p>
                      </ReviewSection>
                    )}

                    {/* CTA banner */}
                    <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">Ready to dispatch</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Nearby tow truck operators will be notified immediately and can accept your request.
                        </p>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav Buttons */}
      <div className="flex gap-3 pb-4">
        {step > 1 && (
          <Button variant="outline" onClick={() => go(step - 1)} className="flex items-center gap-2">
            <ChevronLeft size={16} /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < 5 ? (
          <Button onClick={() => go(step + 1)} disabled={!canProceed()} className="flex items-center gap-2">
            Next <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 min-w-[160px]"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Truck size={16} /> Request Tow Truck
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const ReviewSection = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
    <div className="space-y-1">{children}</div>
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
    <span className="text-xs text-muted-foreground font-semibold shrink-0">{label}</span>
    <span className="text-xs font-semibold text-foreground text-right break-words max-w-[60%]">{value}</span>
  </div>
);
