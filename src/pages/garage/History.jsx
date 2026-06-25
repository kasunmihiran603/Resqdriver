import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Search, Clock, Calendar, Car, User, ClipboardCheck } from "lucide-react";

export const GarageHistory = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();
  const [searchTerm, setSearchTerm] = useState("");

  const history = requests.filter(
    (r) => r.garageId === currentUser.id && r.status === "completed"
  );

  const filteredHistory = history.filter((item) => {
    const text = searchTerm.toLowerCase();
    return (
      item.userName.toLowerCase().includes(text) ||
      item.category.toLowerCase().includes(text) ||
      item.vehicle.make.toLowerCase().includes(text) ||
      item.vehicle.model.toLowerCase().includes(text) ||
      item.vehicle.plate.toLowerCase().includes(text)
    );
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Incident History Archive</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Search and view details of all historical customer orders.</p>
      </div>

      {/* Search filter bar */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search by customer, plate, car make or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Search size={16} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <Card key={item.id} className="border-border/80 relative overflow-hidden">
              <CardContent className="p-5 space-y-4">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        Completed
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">Closed ID: {item.id}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-foreground mt-1">
                      {item.category}
                    </h3>
                  </div>
                  
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-base font-extrabold text-foreground block">{item.fee}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center sm:justify-end gap-1 mt-0.5">
                      <Calendar size={11} /> {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Customer details */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <User size={11} /> Customer Details
                    </p>
                    <p className="font-bold text-foreground">{item.userName}</p>
                    <a href={`tel:${item.userPhone}`} className="text-primary hover:underline font-semibold block">{item.userPhone}</a>
                  </div>

                  {/* Vehicle details */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <Car size={11} /> Vehicle Info
                    </p>
                    <p className="font-bold text-foreground">{item.vehicle.make} {item.vehicle.model}</p>
                    <p className="text-muted-foreground uppercase font-semibold">Plate: {item.vehicle.plate}</p>
                  </div>

                  {/* Diagnostic details */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <ClipboardCheck size={11} /> Dispatch Summary
                    </p>
                    <p className="font-bold text-foreground">Technician: {item.technician?.name || "Self-Fix Helper"}</p>
                    <p className="text-muted-foreground truncate" title={item.location}>📍 {item.location}</p>
                  </div>

                </div>

                {/* Description and logs */}
                <div className="p-3 bg-muted/20 border rounded-xl text-xs space-y-1 text-left">
                  <p className="font-bold text-muted-foreground text-[10px] uppercase">Notes</p>
                  <p className="text-foreground leading-relaxed italic">"{item.description}"</p>
                </div>

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
            <ClipboardCheck size={40} className="mx-auto text-muted-foreground/60 mb-3" />
            <h4 className="font-bold text-foreground">Archive is Empty</h4>
            <p className="text-xs text-muted-foreground mt-1">Completed incidents will be securely cataloged here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
