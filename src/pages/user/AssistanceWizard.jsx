import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Drawer } from "../../components/ui/Drawer";
import { Timeline } from "../../components/ui/Timeline";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Battery,
  Flame,
  HelpCircle,
  Shield,
  Upload,
  Mic,
  MapPin,
  Compass,
  MessageSquare,
  Wrench,
  Car,
  ChevronLeft,
  Play,
  Square,
  Sparkles,
  Phone,
  Navigation,
  Check
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

const InteractiveMap = ({ gps, onGpsChange }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, { zoomControl: true }).setView([gps.lat, gps.lng], 13);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      const marker = L.marker([gps.lat, gps.lng], { draggable: true }).addTo(map);
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
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (leafletMap.current && markerRef.current) {
      markerRef.current.setLatLng([gps.lat, gps.lng]);
      leafletMap.current.setView([gps.lat, gps.lng], 14, { animate: true });
    }
  }, [gps.lat, gps.lng]);

  return <div ref={mapRef} className="w-full h-full min-h-[220px] rounded-t-xl z-0 relative" />;
};

export const AssistanceWizard = () => {
  const { currentUser } = useAuth();
  const { createRequest, requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const { formatAmount } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();

  // Wizard state: 1 (Category), 2 (Diagnostics), 3 (Decision Hub), 4 (Form), 5 (Tracking)
  const [step, setStep] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedRate, setEstimatedRate] = useState(150);

  // Selections
  const [category, setCategory] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [gpsSim, setGpsSim] = useState({ lat: 37.7749, lng: -122.4194 });

  // Upload/Audio simulations
  const [uploadedImages, setUploadedImages] = useState([]);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);

  // AI Drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Active tracking state
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    // Calculate estimated cost strictly based on travel distance to the closest garage
    const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
    const garages = users.filter((u) => u.role === "garage");

    let closestGarage = null;
    let minDistance = Infinity;

    const calculateDistance = (coords1, coords2) => {
      if (!coords1 || !coords2) return 8.5;
      const R = 6371; // radius of Earth in km
      const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
      const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((coords1.lat * Math.PI) / 180) *
        Math.cos((coords2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    garages.forEach((g) => {
      if (g.gps) {
        const dist = calculateDistance(gpsSim, g.gps);
        if (dist < minDistance) {
          minDistance = dist;
          closestGarage = g;
        }
      }
    });

    const distanceKm = minDistance === Infinity ? 8.5 : Math.round(minDistance * 10) / 10;
    const rate = closestGarage?.ratePerKM || 150;
    const costInLKR = distanceKm * rate;
    const costInUSD = costInLKR / 300.0; // convert to USD base for formatAmount

    setEstimatedDistance(distanceKm);
    setEstimatedRate(rate);
    setEstimatedCost(costInUSD);
  }, [gpsSim]);

  // Auto-advance to diagnostics step if a category was pre-selected via routing
  useEffect(() => {
    if (location.state?.preselectedCategory) {
      handleSelectCategory(location.state.preselectedCategory);
      setStep(2);
    }
  }, [location.state]);

  // Set default vehicle
  useEffect(() => {
    if (currentUser?.vehicles?.length > 0) {
      setSelectedVehicle(currentUser.vehicles[0].id);
    }
  }, [currentUser]);

  // Auto-detect GPS location on reaching dispatch step
  useEffect(() => {
    if (step === 4) {
      handleGetCurrentLocation();
    }
  }, [step]);

  // Categories config
  const categories = [
    { name: "Battery Issue", icon: <Battery className="text-amber-500" size={32} />, symptoms: ["Cranking slowly", "Battery light on dashboard", "Dim headlights, click click sound", "Radio works but car won't start"] },
    { name: "Engine Issue", icon: <Wrench className="text-blue-500" size={32} />, symptoms: ["Violent engine rattling", "Limp home mode activated", "Check engine light flashing", "Loss of acceleration power"] },
    { name: "Tire Issue", icon: <Car className="text-emerald-500" size={32} />, symptoms: ["Sudden blowout / hiss noise", "Flat tire on wheel rim", "Pressure alert below 15 PSI", "Steering pulling to the left/right"] },
    { name: "Overheating", icon: <Flame className="text-orange-500" size={32} />, symptoms: ["Steam venting from under hood", "Coolant temperature gauge in Red", "Sweet fluid smell inside cabin", "Engine sputtering and cutting off"] },
    { name: "Accident", icon: <AlertTriangle className="text-rose-500" size={32} />, symptoms: ["Front/Rear collision impact", "Radiator leaking fluid", "Bumper/Fender dragging", "Airbags did not deploy"] },
    { name: "Unknown Problem", icon: <HelpCircle className="text-slate-500" size={32} />, symptoms: ["Strange humming noises", "Burning smell (rubber/electrical)", "Gearbox won't engage", "Brakes feel soft / spongy"] }
  ];

  const currentCategoryObj = categories.find((c) => c.name === category);

  const handleSelectCategory = (catName) => {
    setCategory(catName);
    setSelectedSymptoms([]);
    setStep(2);
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleNextFromDiagnostics = () => {
    if (selectedSymptoms.length === 0) {
      showToast("Please check at least one symptom to help us diagnose.", "error");
      return;
    }
    setStep(3);
  };

  // AI Dialog simulation
  const handleOpenAiFixes = () => {
    setIsAiOpen(true);
    // Initial greeting
    setAiChat([
      {
        sender: "ai",
        text: `Hello ${currentUser?.name}! I see you're experiencing a **${category}** with the following symptoms: ${selectedSymptoms.join(", ")}. Here is my diagnosis and immediate self-fix procedures.`
      },
      {
        sender: "ai",
        text: getDiagnosticAIAdvice(category)
      }
    ]);
  };

  const getDiagnosticAIAdvice = (cat) => {
    if (cat === "Battery Issue") {
      return "💡 **Quick Fix: Jumpstarting**\n\n1. Locate a donor vehicle or heavy duty booster pack.\n2. Connect **RED (+)** clamp to the dead battery (+).\n3. Connect other **RED (+)** clamp to booster (+).\n4. Connect **BLACK (-)** clamp to booster (-).\n5. Connect other **BLACK (-)** clamp to an unpainted metal engine ground of the dead car.\n6. Start the donor car, then start yours. Run engine for 15 minutes.";
    }
    if (cat === "Tire Issue") {
      return "💡 **Quick Fix: Installing the Spare**\n\n1. Find a flat, hard ground and engage the emergency parking brake.\n2. Loosen lug nuts slightly using the tire iron.\n3. Position the jack under frame and lift until wheel is off ground.\n4. Remove lug nuts and swap with your spare tire.\n5. Tighten nuts loosely, lower jack, and finalize torque.";
    }
    return "⚠️ This issue seems complex and could lead to major damage if driven. I recommend requesting emergency mechanical assistance from Apex Auto Care.";
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg = { sender: "user", text: aiInput };
    setAiChat((prev) => [...prev, userMsg]);
    setAiInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      setIsAiTyping(false);
      setAiChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `I've registered your message. For a safe self-fix of ${category}, always wear protective gloves. If safety is at risk, press 'Request Professional Help' in the background.`
        }
      ]);
    }, 1200);
  };

  // Voice note simulation
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasVoiceNote(true);
      showToast("Voice diagnostic attached to request.", "success");
    } else {
      setIsRecording(true);
      setVoiceNoteDuration(0);
      const timer = setInterval(() => {
        setVoiceNoteDuration((prev) => {
          if (prev >= 12) {
            clearInterval(timer);
            setIsRecording(false);
            setHasVoiceNote(true);
            showToast("Voice diagnostic attached.", "success");
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsSim({ lat, lng });
          showToast("Live GPS location acquired successfully!", "success");
        },
        (error) => {
          showToast("Unable to retrieve GPS location. Please allow location permissions in your browser.", "error");
        }
      );
    } else {
      showToast("Geolocation is not supported by your browser.", "error");
    }
  };

  // Image upload simulator
  const simulateImageUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setUploadedImages(["/img-placeholder-1.jpg", "/img-placeholder-2.jpg"]);
      showToast("Simulated photos attached successfully.", "success");
    }
  };

  const handleSubmitRequest = async () => {
    if (!currentUser?.vehicles?.length) {
      showToast("Please register a vehicle first before requesting assistance.", "error");
      navigate("/user/vehicles");
      return;
    }

    const vehicleObj = currentUser.vehicles?.find((v) => v.id === selectedVehicle) || currentUser.vehicles?.[0];

    const finalLocation = locationName.trim()
      ? locationName.trim()
      : `GPS Pin Location (${gpsSim.lat.toFixed(4)}, ${gpsSim.lng.toFixed(4)})`;

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      vehicle: {
        make: vehicleObj?.make || "Unknown",
        model: vehicleObj?.model || "Car",
        year: vehicleObj?.year || "2020",
        plate: vehicleObj?.plate || "MOCK"
      },
      category,
      symptoms: selectedSymptoms.join(", "),
      description: description || "No additional description entered.",
      location: finalLocation,
      gps: gpsSim,
      imageSimulated: uploadedImages.length > 0,
      audioSimulated: hasVoiceNote,
      fee: estimatedCost > 0 ? `$${estimatedCost.toFixed(2)}` : "$5.00"
    };

    try {
      await createRequest(payload);
      showToast("Emergency dispatch signal sent!", "success");
      navigate("/user/track");
    } catch (err) {
      showToast("Failed to dispatch emergency request", "error");
    }
  };

  // Status updates mapping for tracker
  const getTimelineItems = (req) => {
    const timeline = [
      { title: "Emergency Broadcasted", description: "Signal sent. Finding nearest garages.", time: "Just now", status: "completed" }
    ];

    if (req.status === "pending") {
      timeline.push({ title: "Garage Matching", description: "Checking mechanic workloads", time: "In progress", status: "active" });
      timeline.push({ title: "Technician Dispatched", description: "GPS mapping lock", time: "--", status: "upcoming" });
    } else if (req.status === "accepted" || req.status === "technician_assigned") {
      timeline[0].status = "completed";
      timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "3m ago", status: "completed" });
      timeline.push({ title: "Technician Dispatched", description: req.technician ? `Mechanic ${req.technician.name} preparing toolkit` : "Assigning mechanic", time: "Just now", status: "active" });
      timeline.push({ title: "Repair In Progress", description: "On-site diagnostic fix", time: "--", status: "upcoming" });
    } else if (req.status === "on_the_way") {
      timeline[0].status = "completed";
      timeline.push({ title: "Garage Accepted", description: `Accepted by ${req.garageName}`, time: "5m ago", status: "completed" });
      timeline.push({ title: "On the Way", description: `${req.technician?.name || "Mechanic"} driving to your GPS location. ETA: ${req.eta}`, time: "Just now", status: "active" });
      timeline.push({ title: "Repair Completed", description: "Incident resolved", time: "--", status: "upcoming" });
    } else if (req.status === "repair_in_progress") {
      timeline[0].status = "completed";
      timeline.push({ title: "Technician Arrived", description: `${req.technician?.name} arrived on site.`, time: "3m ago", status: "completed" });
      timeline.push({ title: "Repair Underway", description: "Active tool adjustments and part swap.", time: "Just now", status: "active" });
      timeline.push({ title: "Completed", description: "Payment ledger resolved", time: "--", status: "upcoming" });
    }

    return timeline;
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">

      {/* Back to dashboard button (only if not tracking active job) */}
      {step < 5 && (
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else navigate("/user/dashboard");
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          <ChevronLeft size={16} /> Back {step > 1 ? `to Step ${step - 1}` : "to Dashboard"}
        </button>
      )}

      {/* STEPPER PROGRESS HEADER */}
      {step < 5 && (
        <div className="grid grid-cols-4 gap-2 border-b border-border pb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col gap-1">
              <div className={`h-1.5 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block ${s === step ? "text-primary font-black" : "text-muted-foreground"}`}>
                {s === 1 && "Category"}
                {s === 2 && "Diagnostics"}
                {s === 3 && "Decision"}
                {s === 4 && "Submit Request"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Select Problem Category</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Which component of the vehicle seems faulty?</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <Card
                key={idx}
                hoverable
                onClick={() => handleSelectCategory(cat.name)}
                className={`cursor-pointer hover:border-primary/50 border-border/80 ${category === cat.name ? "border-primary bg-primary/[0.02]" : ""}`}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                    {cat.icon}
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{cat.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* STEP 2: DIAGNOSTICS */}
      {step === 2 && currentCategoryObj && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Diagnostic Symptoms</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Select the symptoms that best describe the issue.</p>
          </div>

          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center gap-3 bg-muted/20 border-b">
              <div className="p-2 bg-card border rounded-xl">{currentCategoryObj.icon}</div>
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Diagnosing</CardTitle>
                <h4 className="text-base font-extrabold text-foreground">{category}</h4>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentCategoryObj.symptoms.map((symptom, idx) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`flex items-start text-left gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${isChecked
                        ? "border-primary bg-primary/[0.04] text-foreground font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                        }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-card"
                        }`}>
                        {isChecked && <Check size={12} className="stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm">{symptom}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Change Category
            </Button>
            <Button className="flex-1" onClick={handleNextFromDiagnostics}>
              Analyze Action
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: DECISION HUB */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2 py-4">
            <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground">Diagnostic Complete</h3>
            <p className="text-sm text-muted-foreground">
              We've evaluated your symptoms. Choose a path to get your vehicle back in service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* AI drawer trigger */}
            <Card hoverable className="border-primary/20 bg-primary/[0.01] hover:border-primary/40 flex flex-col justify-between h-full">
              <CardHeader className="pb-3 text-left">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3">
                  <Sparkles size={20} />
                </div>
                <CardTitle className="text-base font-bold text-foreground">AI Guided Self-Fix</CardTitle>
                <CardDescription>
                  Access our interactive smart drawer with safety procedures, tool checklists, and stepwise instructions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button onClick={handleOpenAiFixes} variant="outline" className="w-full flex items-center justify-center gap-1.5">
                  Open AI Guide <Sparkles size={16} className="text-primary" />
                </Button>
              </CardContent>
            </Card>

            {/* Request dispatch */}
            <Card hoverable className="border-border/80 flex flex-col justify-between h-full">
              <CardHeader className="pb-3 text-left">
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 w-fit mb-3">
                  <AlertTriangle size={20} />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Dispatch Professional Help</CardTitle>
                <CardDescription>
                  Share GPS coordinates, upload photos, and broadcast your issue to verified local mechanics.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button onClick={() => setStep(4)} className="w-full">
                  Request Assistance
                </Button>
              </CardContent>
            </Card>

          </div>
        </motion.div>
      )}

      {/* STEP 4: SERVICE REQUEST FORM */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Assistance Dispatch Details</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Please share location and issue descriptions for dispatch lock.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Form Inputs (Left side) */}
            <div className="lg:col-span-2 space-y-4">

              {/* Vehicle Select */}
              <Select
                label="Select Affected Vehicle"
                id="vehicle-select"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                {currentUser?.vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.plate})
                  </option>
                ))}
              </Select>

              {/* Description */}
              <Textarea
                label="Detailed Description"
                placeholder="Describe any warning lights, sounds, or events preceding the failure..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />

              {/* Image & Audio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Visual attachments dropzone */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-foreground">Attach Photos</label>
                  <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer relative bg-muted/10 h-32">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={simulateImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadedImages.length > 0 ? (
                      <div className="flex gap-2">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="w-14 h-14 bg-muted border border-border rounded-lg flex items-center justify-center text-[10px] font-bold text-muted-foreground bg-center bg-cover">
                            Pic {idx + 1}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-muted-foreground mb-1.5" />
                        <span className="text-xs font-bold text-foreground">Upload Damage Photos</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Drag photos or click here</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Voice Note Simulator */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-foreground">Audio Symptom Diagnostic</label>
                  <div className="border border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/15 h-32 space-y-3">
                    {isRecording ? (
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                        <div className="h-6 w-20 flex gap-0.5 items-center justify-center">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className="w-1 bg-rose-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 4}px`, animationDelay: `${i * 100}ms` }} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-rose-500">00:{voiceNoteDuration.toString().padStart(2, "0")}</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        {hasVoiceNote ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-center">
                            <Check size={14} className="stroke-[2.5]" /> Voice note attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Record engine noise/symptom</span>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleToggleVoiceRecord}
                      size="sm"
                      variant={isRecording ? "destructive" : hasVoiceNote ? "outline" : "primary"}
                      className="h-8 text-xs flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      {isRecording ? (
                        <>
                          <Square size={12} fill="currentColor" /> Stop
                        </>
                      ) : (
                        <>
                          <Mic size={12} /> {hasVoiceNote ? "Record Again" : "Record Voice"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </div>

            {/* GPS Map Location Selector (Right side) */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Emergency GPS Coordinates</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Compass size={14} /> Detect Live Location
                  </button>
                </div>
                
                {/* Interactive Leaflet Map UI */}
                <div className="border border-border rounded-xl h-56 relative overflow-hidden bg-card border-b-0 rounded-b-none flex flex-col justify-center items-center text-center">
                  <InteractiveMap gps={gpsSim} onGpsChange={setGpsSim} />

                  <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-xs p-1.5 rounded-lg border border-border/60 text-[9px] font-bold text-center z-10 pointer-events-none shadow-md">
                    LAT: {gpsSim.lat.toFixed(5)}, LNG: {gpsSim.lng.toFixed(5)}
                  </div>
                </div>

                <Input
                  id="loc-input"
                  placeholder="Enter manual location address (e.g. Exit 44 near Chevron)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="rounded-t-none border-t-0"
                />
              </div>
            </div>

          </div>

          {/* Estimated Cost Display */}
          {estimatedCost > 0 && (
            <div className="flex flex-col p-4 bg-muted/40 border border-border/80 rounded-xl mb-4 space-y-1 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Estimated Dispatch Fee:</span>
                <span className="text-base font-black text-primary">{formatAmount(estimatedCost)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/80 font-medium">
                Calculated dynamically: {estimatedDistance} km to closest garage @ LKR {estimatedRate}/km.
              </p>
            </div>
          )}

          {/* Submit button — always visible at the bottom */}
          <div className="pt-2 border-t border-border">
            <Button onClick={handleSubmitRequest} className="w-full flex items-center justify-center gap-2 h-12 text-base font-bold">
              <Navigation size={20} className="rotate-45" />
              Broadcast Help Call
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: LIVE REQUEST TRACKING */}
      {step === 5 && activeRequest && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border border-rose-500/20">
                Live Incident Tracking
              </span>
              <h2 className="text-2xl font-black text-foreground mt-1.5">{activeRequest.category} Dispatch</h2>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {activeRequest.id} • Registered {new Date(activeRequest.timestamp).toLocaleTimeString()}</p>
            </div>

            {/* Action buttons */}
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

            {/* Status updates, Timeline, Garage card */}
            <div className="lg:col-span-2 space-y-6">

              {/* ETA Highlight */}
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

              {/* Service Timeline */}
              <Card className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Assistance Progression Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 text-left">
                  <Timeline items={getTimelineItems(activeRequest)} />
                </CardContent>
              </Card>

            </div>

            {/* Side summary of mechanic and maps */}
            <div className="space-y-6">

              {/* Garage card details */}
              {activeRequest.garageName ? (
                <Card className="border-border/80 text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assigned Partner</CardTitle>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">{activeRequest.garageName}</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Mechanic contact */}
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
                      <div className="text-xs text-muted-foreground italic py-2">
                        Garage is selecting best technician.
                      </div>
                    )}

                    <div className="text-xs space-y-1 text-muted-foreground border-t border-border/50 pt-3">
                      <p>📍 **Dispatched Location:**</p>
                      <p className="font-semibold text-foreground text-[11px] leading-relaxed">{activeRequest.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-border/85 bg-muted/10">
                  <CardContent className="p-8 text-center space-y-3">
                    <Wrench size={32} className="mx-auto text-muted-foreground/60 animate-spin" />
                    <h4 className="font-bold text-foreground text-sm">Searching Garages</h4>
                    <p className="text-xs text-muted-foreground">
                      We have broadcasted your GPS coordinates to garages in Sector 7. Keep this page open.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* GPS active path tracker simulation */}
              <Card className="border-border/80 overflow-hidden h-60 relative flex flex-col justify-center items-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/maps-bg.png')" }} />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Center marker */}
                <div className="relative flex items-center justify-center z-10">
                  {/* Outer waves */}
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
      )}

      {/* AI SELF-FIX INTERACTIVE DRAWER */}
      <Drawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        title="AI Assistant: Self-Fix Guide"
      >
        <div className="flex flex-col h-[calc(85vh-90px)]">
          {/* Chat feed container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
            {aiChat.map((msg, idx) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={idx} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${isAi
                    ? "bg-muted text-foreground rounded-tl-xs whitespace-pre-line border border-border/40"
                    : "bg-primary text-primary-foreground rounded-tr-xs shadow-md"
                    }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick options panel */}
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAiInput("What safety tools do I need for this?");
              }}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              🛠️ Check tools list
            </button>
            <button
              onClick={() => {
                setAiInput("Is it safe to drive with this symptom?");
              }}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              ⚠️ Safety warning check
            </button>
          </div>

          {/* Chat send bar */}
          <div className="flex gap-2 border-t border-border pt-4 shrink-0">
            <input
              type="text"
              placeholder="Ask the mechanic AI..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
              className="flex-1 h-11 px-3 border border-border bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={sendAiMessage} size="sm" className="h-11 px-4">
              Send
            </Button>
          </div>
        </div>
      </Drawer>

    </div>
  );
};