import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Truck, MapPin, Phone, Clock, ClipboardList, CheckCircle } from "lucide-react";

export const TowingDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(feeStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Filter towing specific requests (category 'Accident' or explicitly assigned)
  const towingJobs = requests.filter((r) => r.towingId === currentUser.id);
  const unclaimedTows = requests.filter((r) => r.status === "pending" && !r.towingId && (r.isTowingRequest || r.category === "Accident"));
  const activeJob = towingJobs.find((r) => r.status !== "completed");
  const completedJobs = towingJobs.filter((r) => r.status === "completed");

  const totalEarnings = completedJobs.reduce((acc, curr) => {
    const numeric = parseFee(curr.fee);
    return acc + (numeric * 0.90);
  }, 0);

  const handleAcceptJob = (reqId) => {
    if (activeJob) {
      showToast("Please complete your active tow job first.", "error");
      return;
    }
    updateRequestStatus(reqId, "accepted", {
      towingId: currentUser.id,
      towingName: currentUser.name,
      eta: "18 mins" // default driver ETA
    });
    showToast("Towing job accepted. Dispatched to coordinates.", "success");
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
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Tow Earnings</span>
              <p className="text-2xl font-black text-foreground">{formatAmount(totalEarnings)}</p>
              <span className="text-[10px] text-primary font-bold block">Based on flat collision rates</span>
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
                  <MapPin size={13} className="text-muted-foreground" /> Pickup: {activeJob.location}
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
                    <p className="text-xs text-foreground font-semibold">📍 {req.location}</p>
                  </div>
                  <Button onClick={() => handleAcceptJob(req.id)} size="sm" className="shrink-0 h-9 text-xs px-3">
                    Accept Tow
                  </Button>
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
                    <span className="font-extrabold text-foreground">{formatAmount(parseFee(req.fee))}</span>
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

    </div>
  );
};
