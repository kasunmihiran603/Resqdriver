import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequests } from "../../context/RequestContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertTriangle, Eye, ShieldAlert } from "lucide-react";

export const AuditDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests } = useRequests();
  const { formatAmount } = useCurrency();

  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(feeStr.replace(/[^0-9.]/g, "")) || 0;
  };

  const incident = requests.find((r) => r.id === id);

  const statusBadges = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25",
    accepted: "bg-blue-500/10 text-blue-500 border-blue-500/25",
    technician_assigned: "bg-indigo-500/10 text-indigo-500 border-indigo-500/25",
    on_the_way: "bg-purple-500/10 text-purple-500 border-purple-500/25",
    repair_in_progress: "bg-sky-500/10 text-sky-500 border-sky-500/25",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto py-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate("/admin/services")}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
      >
        <ArrowLeft size={16} /> Back to Services Feed
      </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Incident Audit Log</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Audit History for Incident [{id}]</p>
      </div>

      {incident ? (
        <Card className="border-border/80 shadow-xl bg-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex justify-between items-start gap-2">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">{incident.category}</CardTitle>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">Incident ID: {incident.id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${statusBadges[incident.status]}`}>
                {incident.status.replace(/_/g, " ")}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-5 text-xs leading-relaxed">
            
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/40">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Driver / Client</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{incident.userName}</p>
                <p className="text-muted-foreground text-[10px]">{incident.userPhone}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Vehicle</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{incident.vehicle.make} {incident.vehicle.model}</p>
                <p className="text-muted-foreground text-[10px]">Plate: {incident.vehicle.plate} • Year: {incident.vehicle.year}</p>
              </div>
            </div>

            {/* Support grid */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/40">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Service Fee</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatAmount(parseFee(incident.fee))}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Payment Status</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border mt-0.5 uppercase tracking-wide ${
                  incident.paymentStatus === "paid"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                }`}>
                  {incident.paymentStatus}
                </span>
              </div>
            </div>

            {/* Location details */}
            <div className="space-y-1 pb-4 border-b border-border/40">
              <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Location details</p>
              <p className="font-bold text-foreground flex items-center gap-1.5 text-[13px]">📍 {incident.location}</p>
            </div>

            {/* Symptoms details */}
            <div className="space-y-1 pb-4 border-b border-border/40">
              <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Symptom Checklist</p>
              <p className="font-bold text-foreground text-[13px]">{incident.symptoms || "None checked"}</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-wider">Additional details</p>
              <div className="p-3.5 bg-muted/50 rounded-xl border border-border/50 italic text-muted-foreground">
                "{incident.description || "No description provided."}"
              </div>
            </div>

            {/* Attachments */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Photos Uploaded</p>
                <p className="font-bold text-foreground mt-1">{incident.imageSimulated ? "✅ Damage Photos Attached" : "❌ No attachment"}</p>
              </div>
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Voice Diagnostics</p>
                <p className="font-bold text-foreground mt-1">{incident.audioSimulated ? "✅ Voice Note Attached" : "❌ No attachment"}</p>
              </div>
            </div>

          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 bg-card p-8 text-center space-y-4">
          <ShieldAlert size={48} className="mx-auto text-destructive" />
          <div>
            <h3 className="font-bold text-lg text-foreground">Incident Log Not Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              The requested incident with ID "{id}" could not be retrieved from VAMP records.
            </p>
          </div>
          <Button onClick={() => navigate("/admin/services")} variant="outline" className="mx-auto">
            Return to Feeds
          </Button>
        </Card>
      )}
    </div>
  );
};
