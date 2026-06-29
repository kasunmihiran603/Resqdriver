import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../../context/RequestContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Activity, Search, MapPin, Eye, ShieldAlert, CheckCircle } from "lucide-react";

export const AdminServices = () => {
  const { requests } = useRequests();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter((r) => {
    const text = searchTerm.toLowerCase();
    return (
      r.userName.toLowerCase().includes(text) ||
      r.category.toLowerCase().includes(text) ||
      r.location.toLowerCase().includes(text) ||
      (r.garageName && r.garageName.toLowerCase().includes(text))
    );
  });

  const statusBadges = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25",
    accepted: "bg-blue-500/10 text-blue-500 border-blue-500/25",
    technician_assigned: "bg-indigo-500/10 text-indigo-500 border-indigo-500/25",
    on_the_way: "bg-purple-500/10 text-purple-500 border-purple-500/25",
    repair_in_progress: "bg-sky-500/10 text-sky-500 border-sky-500/25",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Global Incident Feeds</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Audit and inspect real-time road emergencies and job statuses.</p>
      </div>

      {/* Filter search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search requests by client, location, garage, or issue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Search size={16} />
        </div>
      </div>

      {/* Grid list of logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <Card key={req.id} className="border-border/80 relative flex flex-col justify-between">
              <CardContent className="p-6 space-y-4 flex-1">
                
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm">{req.category}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">ID: {req.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${statusBadges[req.status]}`}>
                    {req.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs space-y-2 border-y border-border/50 py-3">
                  <p className="font-bold text-foreground">👤 Driver: <span className="font-semibold text-muted-foreground">{req.userName} ({req.vehicle.make} {req.vehicle.model})</span></p>
                  <p className="font-bold text-foreground">📍 Location: <span className="font-semibold text-muted-foreground leading-relaxed truncate block"> {req.location}</span></p>
                  {req.garageName && (
                    <p className="font-bold text-foreground">🛠️ Garage: <span className="font-semibold text-muted-foreground">{req.garageName} {req.technician && `(${req.technician.name})`}</span></p>
                  )}
                  {req.towingName && (
                    <p className="font-bold text-foreground">🚛 Towing: <span className="font-semibold text-muted-foreground">{req.towingName}</span></p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground truncate italic">"{req.description}"</p>

              </CardContent>

              <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex justify-between items-center shrink-0">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {new Date(req.timestamp).toLocaleDateString()} {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => navigate(`/admin/audit/${req.id}`)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={13} /> View Audit
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <Activity size={40} className="mx-auto text-muted-foreground/60 mb-3" />
            <h4 className="font-bold text-foreground">No Incidents Feed</h4>
            <p className="text-xs text-muted-foreground mt-1">No emergency logs match search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
