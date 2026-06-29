import React, { useState } from "react";
import jsPDF from "jspdf";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useCurrency } from "../../context/CurrencyContext";
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
  Navigation,
  Star,
  Download,
  CreditCard,
  Truck
} from "lucide-react";

export const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { getRequestsByRole } = useRequests();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

  // Strip any existing currency symbol and convert to a raw USD number
  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(String(feeStr).replace(/[^0-9.]/g, "")) || 0;
  };

  const userRequests = getRequestsByRole("user", currentUser?.id);
  const activeRequests = userRequests.filter((r) => r.status !== "completed");
  const completedRequests = userRequests.filter((r) => r.status === "completed");
  const unpaidCompletedRequests = completedRequests.filter((r) => r.paymentStatus === "unpaid");
  
  const [ratings, setRatings] = useState({});

  const handleRate = (reqId, stars) => {
    setRatings((prev) => ({ ...prev, [reqId]: stars }));
    localStorage.setItem(`vamp-rating-${reqId}`, stars);
  };

  // ── PDF Invoice Generator ──────────────────────────────────────────────────
  // Generates and downloads a PDF invoice for a completed request using jsPDF.
  const generateInvoicePDF = (req) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const accent = [37, 99, 235]; // brand blue
    const dark = [15, 23, 42];
    const muted = [100, 116, 139];

    // ── Header bar ──
    doc.setFillColor(...accent);
    doc.rect(0, 0, pageW, 64, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("ResQDriver", 40, 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Vehicle Assistance & Emergency Management Platform", 40, 54);

    // ── Invoice meta ──
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("DISPATCH INVOICE", 40, 100);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
    doc.text(`Generated: ${now}`, pageW - 40, 100, { align: "right" });

    // ── Divider ──
    doc.setDrawColor(...accent);
    doc.setLineWidth(1.5);
    doc.line(40, 110, pageW - 40, 110);

    // ── Request details table ──
    const rows = [
      ["Request ID",    req.id],
      ["Incident Type", req.category || "—"],
      ["Vehicle",       req.vehicle ? `${req.vehicle.make} ${req.vehicle.model} (${req.vehicle.plate})` : "—"],
      ["Garage / Provider", req.garageName || req.towingName || "—"],
      ["Location",     req.location || "—"],
      ["Distance",     req.distance != null ? `${req.distance} km` : "—"],
      ["Status",       req.status?.replace(/_/g, " ") || "—"],
      ["Payment",      req.paymentStatus === "paid" ? "Paid" : "Unpaid"],
    ];

    let y = 135;
    const col1 = 40;
    const col2 = 200;
    doc.setFontSize(10);
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);
      doc.text(label, col1, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);
      doc.text(String(value), col2, y);
      y += 22;
    });

    // ── Fee breakdown ──
    y += 12;
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.5);
    doc.line(40, y, pageW - 40, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text("Fee Breakdown", col1, y);
    y += 22;

    const rawFee = req.fee ? parseFloat(req.fee.replace(/[^0-9.]/g, "")) || 0 : 0;
    const dispatchCost    = req.dispatchCost    ?? rawFee;
    const platCommission  = req.platformCommission ?? (dispatchCost > 0 ? Math.round(dispatchCost * 0.10 * 100) / 100 : 0);
    const providerShare   = req.providerShare   ?? Math.round((dispatchCost - platCommission) * 100) / 100;

    const fmtUSD = (n) => `$${n.toFixed(2)}`;
    const feeRows = [
      ["Dispatch Fee (Provider Share — 90%)", fmtUSD(providerShare)],
      ["Platform Commission (10%)",           fmtUSD(platCommission)],
    ];

    doc.setFontSize(10);
    feeRows.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...muted);
      doc.text(label, col1, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(value, pageW - 40, y, { align: "right" });
      y += 20;
    });

    // Grand Total row
    y += 6;
    doc.setFillColor(243, 247, 255);
    doc.roundedRect(col1, y - 14, pageW - 80, 28, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accent);
    doc.text("Grand Total (Dispatch Cost)", col1 + 10, y + 6);
    doc.text(dispatchCost > 0 ? fmtUSD(dispatchCost) : "Pending", pageW - 50, y + 6, { align: "right" });

    // ── Footer ──
    y = doc.internal.pageSize.getHeight() - 50;
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 220, 230);
    doc.line(40, y, pageW - 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(
      "This invoice is system-generated by ResQDriver. The dispatch fee covers travel/transport costs only.",
      pageW / 2,
      y + 16,
      { align: "center" }
    );
    doc.text("Platform Commission is deducted at source and not payable separately by the customer.", pageW / 2, y + 28, { align: "center" });

    doc.save(`ResQDriver_Invoice_${req.id}.pdf`);
  };
  // ──────────────────────────────────────────────────────────────────────────

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
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => navigate("/user/request")} className="shrink-0 flex items-center gap-2">
            <AlertTriangle size={18} className="animate-bounce" />
            Request Emergency Help
          </Button>
          <Button onClick={() => navigate("/user/tow-request")} variant="outline" className="shrink-0 flex items-center gap-2">
            <Truck size={18} />
            Request a Tow
          </Button>
        </div>
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

      {/* Service Completed & Awaiting Payment Card */}
      {unpaidCompletedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary animate-pulse" />
            Service Clearings Awaiting Payment
          </h3>
          <div className="grid gap-4">
            {unpaidCompletedRequests.map((req) => {
              const currentRating = ratings[req.id] || parseInt(localStorage.getItem(`vamp-rating-${req.id}`) || "0");
              return (
                <Card key={req.id} className="border-primary/30 bg-primary/[0.01] relative overflow-hidden">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 text-left flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-primary/10 text-primary border-primary/20">
                          Pending Settlement
                        </span>
                        <span className="text-xs text-muted-foreground">ID: {req.id}</span>
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        {req.category} — Completed by {req.garageName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Vehicle: <span className="font-semibold text-foreground">{req.vehicle.make} {req.vehicle.model} ({req.vehicle.plate})</span>
                      </p>
                      
                      {/* Interactive 5-Star Rating */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Rate Garage:</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRate(req.id, star)}
                              className="focus:outline-hidden hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={18}
                                className={
                                  star <= currentRating
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground/60 hover:text-amber-500"
                                }
                              />
                            </button>
                          ))}
                        </div>
                        {currentRating > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
                            Thank you!
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5 shrink-0">
                      <Button
                        onClick={() => generateInvoicePDF(req)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Download size={14} /> Invoice
                      </Button>
                      <Button
                        onClick={() => navigate("/user/payments")}
                        size="sm"
                        className="flex items-center gap-1.5 text-xs bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/10"
                      >
                        <CreditCard size={14} /> Pay Now ({formatAmount(parseFee(req.fee))})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                          <td className="p-4 font-bold text-foreground">{formatAmount(parseFee(req.fee))}</td>
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
                          <span className="font-bold text-foreground">{formatAmount(parseFee(req.fee))}</span>
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
