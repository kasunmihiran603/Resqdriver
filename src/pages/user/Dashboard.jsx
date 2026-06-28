import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  AlertTriangle,
  Car,
  Wrench,
  ChevronRight,
  Battery,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Navigation
} from "lucide-react";

export const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { getRequestsByRole } = useRequests();
  const navigate = useNavigate();

  const userRequests = getRequestsByRole("user", currentUser?.id);
  const activeRequests = userRequests.filter((r) => r.status !== "completed");
  const completedRequests = userRequests.filter((r) => r.status === "completed");

  const quickActions = [
    {
      title: "Battery Issues",
      desc: "Dead battery, jumpstarts or replacements",
      icon: <Battery size={24} className="text-amber-500" />,
      color: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20",
      category: "Battery Issue"
    },
    {
      title: "Engine Problems",
      desc: "Overheating, rattling, smoke, limp mode",
      icon: <Wrench size={24} className="text-blue-500" />,
      color: "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20",
      category: "Engine Issue"
    },
    {
      title: "Flat Tires",
      desc: "Blowouts, punctures or replacement",
      icon: <Car size={24} className="text-emerald-500" />,
      color: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20",
      category: "Tire Issue"
    },
    {
      title: "Accidents / Collisions",
      desc: "Structural fender-benders or emergency tow",
      icon: <AlertOctagon size={24} className="text-rose-500" />,
      color: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20",
      category: "Accident"
    }
  ];

  const statusBadges = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25",
    accepted: "bg-blue-500/10 text-blue-500 border-blue-500/25",
    technician_assigned: "bg-indigo-500/10 text-indigo-500 border-indigo-500/25",
    on_the_way: "bg-purple-500/10 text-purple-500 border-purple-500/25",
    repair_in_progress: "bg-sky-500/10 text-sky-500 border-sky-500/25",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
  };

  const startAssistance = (category) => {
    navigate("/user/request", { state: { preselectedCategory: category } });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/15 shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Hello, {currentUser?.name}!</h2>
          <p className="text-sm text-muted-foreground mt-1">Need help on the road? Launch an emergency request wizard immediately.</p>
        </div>
        <Button onClick={() => navigate("/user/request")} className="shrink-0 flex items-center gap-2">
          <AlertTriangle size={18} className="animate-bounce" />
          Request Emergency Help
        </Button>
      </div>

      {/* 2. Active Requests Highlight */}
      {activeRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            Active Emergency Request
          </h3>
          <div className="grid gap-4">
            {activeRequests.map((req) => (
              <Card key={req.id} className="border-rose-500/30 bg-rose-500/[0.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadges[req.status]}`}>
                        {req.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock size={12} /> ETA: {req.eta}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {req.category} — {req.vehicle.make} {req.vehicle.model}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-xl truncate">{req.description}</p>
                    {req.garageName && (
                      <p className="text-xs text-foreground font-semibold">
                        Assigned Garage: <span className="text-primary">{req.garageName}</span>
                        {req.technician && ` (${req.technician.name})`}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => navigate("/user/track", { state: { focusRequestId: req.id } })} size="sm" className="shrink-0 flex items-center gap-1">
                    Track Assistance <ChevronRight size={14} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. Quick Actions Cards Grid */}
      <div className="space-y-3 text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Diagnostic Assists</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Card
              key={idx}
              hoverable
              onClick={() => startAssistance(action.category)}
              className={`border border-border/80 ${action.color}`}
            >
              <CardContent className="p-5 space-y-3 flex flex-col h-full justify-between items-start text-left">
                <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs">
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm">{action.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Vehicles Summary & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Vehicles side card */}
        <Card className="lg:col-span-1 border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">My Vehicles</CardTitle>
              <CardDescription>Registered automobiles</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/user/vehicles")} className="p-1 text-primary">
              Manage
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {currentUser?.vehicles?.length > 0 ? (
              currentUser.vehicles.map((v) => (
                <div key={v.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Car size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-foreground">{v.make} {v.model}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{v.plate} • {v.year}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No vehicles registered.
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Area */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Recent Incident Logs</CardTitle>
            <CardDescription>History of requested assistances</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {completedRequests.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-y border-border/50 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                        <th className="p-4">Incident & Vehicle</th>
                        <th className="p-4">Assigned Garage</th>
                        <th className="p-4">Fee Paid</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {completedRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-foreground">{req.category}</p>
                            <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-foreground">{req.garageName || "Self-Fix Helper"}</p>
                          </td>
                          <td className="p-4 font-bold text-foreground">{req.fee}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusBadges[req.status]}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(req.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden divide-y divide-border/60">
                  {completedRequests.map((req) => (
                    <div key={req.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">{req.category}</p>
                          <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusBadges[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/20 p-2.5 rounded-lg border border-border/40">
                        <div>
                          <span className="text-muted-foreground block text-[9px] font-bold uppercase">Provider</span>
                          <span className="font-bold">{req.garageName || "Self-Fix AI"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] font-bold uppercase">Fee</span>
                          <span className="font-bold text-foreground">{req.fee}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/80 text-right">
                        Closed on {new Date(req.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No history records found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
