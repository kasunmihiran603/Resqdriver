import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Wrench, Phone, Clipboard, CheckCircle, Navigation, MapPin } from "lucide-react";

export const GarageRequests = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useRequests();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("all"); // all, unclaimed, active, completed
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [customEta, setCustomEta] = useState("");

  // Categorize requests
  const unclaimed = requests.filter((r) => r.status === "pending" && !r.garageId && !r.towingId);
  const active = requests.filter((r) => r.garageId === currentUser.id && r.status !== "completed");
  const completed = requests.filter((r) => r.garageId === currentUser.id && r.status === "completed");

  const handleClaim = (reqId) => {
    updateRequestStatus(reqId, "accepted", {
      garageId: currentUser.id,
      garageName: currentUser.name
    });
    showToast("Incident claimed. Please assign a technician.", "success");
  };

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedTechId(currentUser.technicians[0]?.id || "");
    setIsAssignOpen(true);
  };

  const handleConfirmAssign = () => {
    const tech = currentUser.technicians.find((t) => t.id === selectedTechId);
    if (!tech) {
      showToast("Please register a technician first.", "error");
      return;
    }

    updateRequestStatus(selectedRequest.id, "technician_assigned", {
      technician: { id: tech.id, name: tech.name, phone: tech.phone },
      eta: "20 mins"
    });
    
    showToast(`Assigned ${tech.name} to dispatch.`, "success");
    setIsAssignOpen(false);
  };

  const handleOpenStatus = (req) => {
    setSelectedRequest(req);
    setCustomEta(req.eta);
    setIsStatusOpen(true);
  };

  const handleConfirmStatus = (status) => {
    const fields = {};
    if (status === "on_the_way" && customEta) {
      fields.eta = customEta;
    }
    if (status === "completed") {
      fields.eta = "Completed";
    }

    updateRequestStatus(selectedRequest.id, status, fields);
    showToast(`Incident status updated to ${status.replace(/_/g, " ")}.`, "success");
    setIsStatusOpen(false);
  };

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
        <h2 className="text-xl font-bold tracking-tight text-foreground">Service Request Center</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Claim incoming road emergency logs and schedule dispatch drivers.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 cursor-pointer transition-colors ${activeTab === "all" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          All Requests ({unclaimed.length + active.length + completed.length})
        </button>
        <button
          onClick={() => setActiveTab("unclaimed")}
          className={`pb-3 cursor-pointer transition-colors ${activeTab === "unclaimed" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Nearby Unclaimed ({unclaimed.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 cursor-pointer transition-colors ${activeTab === "active" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Active Shop Orders ({active.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-3 cursor-pointer transition-colors ${activeTab === "completed" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          History Logs ({completed.length})
        </button>
      </div>

      {/* Data Views Container */}
      <div className="space-y-6">
        
        {/* SECTION 1: UNCLAIMED (Available nearby) */}
        {(activeTab === "all" || activeTab === "unclaimed") && unclaimed.length > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/[0.01]">
            <CardHeader className="bg-yellow-500/5 py-4 border-b border-yellow-500/10">
              <CardTitle className="text-sm font-bold text-yellow-600 flex items-center gap-2">
                ⚠️ Nearby Broadcast Board (Unclaimed)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {unclaimed.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                        Pending
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">Incident ID: {req.id}</span>
                    </div>
                    <h4 className="font-extrabold text-foreground text-sm">{req.category} — {req.vehicle.make} {req.vehicle.model}</h4>
                    <p className="text-xs text-muted-foreground/90 max-w-2xl">{req.description}</p>
                    <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                      <MapPin size={13} className="text-muted-foreground" /> {req.location}
                    </p>
                  </div>
                  <Button onClick={() => handleClaim(req.id)} size="sm" className="shrink-0">
                    Accept & Schedule
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* SECTION 2: ACTIVE REPAIRS */}
        {(activeTab === "all" || activeTab === "active") && (
          <Card className="border-border/80">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold">Active Shop Orders</CardTitle>
              <CardDescription>Emergency calls currently accepted and managed by Apex Auto Care</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {active.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border font-bold text-[10px] uppercase text-muted-foreground tracking-wider">
                          <th className="p-4">Customer & Car</th>
                          <th className="p-4">Issue Category</th>
                          <th className="p-4">Assigned Tech</th>
                          <th className="p-4">ETA Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {active.map((req) => (
                          <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-foreground">{req.userName}</p>
                              <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model} ({req.vehicle.plate})</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-foreground">{req.category}</p>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] border font-black uppercase mt-1 ${statusBadges[req.status]}`}>
                                {req.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="p-4">
                              {req.technician ? (
                                <div>
                                  <p className="font-semibold text-foreground">{req.technician.name}</p>
                                  <a href={`tel:${req.technician.phone}`} className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                                    <Phone size={10} /> Call
                                  </a>
                                </div>
                              ) : (
                                <button onClick={() => handleOpenAssign(req)} className="text-primary font-bold hover:underline">
                                  + Assign Tech
                                </button>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-foreground">{req.eta}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs px-2.5" onClick={() => handleOpenStatus(req)}>
                                  Set Status
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-border/60">
                    {active.map((req) => (
                      <div key={req.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground">{req.userName}</p>
                            <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusBadges[req.status]}`}>
                            {req.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                          <p>🛠️ **Category:** {req.category}</p>
                          <p className="mt-1">👤 **Tech:** {req.technician?.name || "Unassigned"}</p>
                          <p className="mt-1">⏱️ **ETA:** {req.eta}</p>
                        </div>
                        <div className="flex gap-2">
                          {!req.technician ? (
                            <Button size="sm" className="flex-1 text-xs h-9 px-3" onClick={() => handleOpenAssign(req)}>
                              Assign Tech
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-9 px-3" onClick={() => handleOpenStatus(req)}>
                              Change Status
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  No active shop orders. Claim or assign nearby issues.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SECTION 3: COMPLETED LOGS */}
        {(activeTab === "all" || activeTab === "completed") && (
          <Card className="border-border/80">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold">Closed Service Records</CardTitle>
              <CardDescription>Archive of resolved breakdowns and repair ledger fees</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {completed.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border font-bold text-[10px] uppercase text-muted-foreground">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Incident Log</th>
                        <th className="p-4">Technician</th>
                        <th className="p-4">Fee Charged</th>
                        <th className="p-4">Closed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {completed.map((req) => (
                        <tr key={req.id}>
                          <td className="p-4 font-bold text-foreground">{req.userName}</td>
                          <td className="p-4">
                            <p className="font-semibold text-foreground">{req.category}</p>
                            <p className="text-[10px] text-muted-foreground">{req.vehicle.make} {req.vehicle.model}</p>
                          </td>
                          <td className="p-4 font-semibold text-foreground">{req.technician?.name || "Self-Fix Guide"}</td>
                          <td className="p-4 font-bold text-foreground">{req.fee}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(req.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  No history records archived yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {/* ASSIGN TECHNICIAN MODAL */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Field Technician">
        <div className="space-y-4">
          <Select
            label="Choose Available Mechanic"
            id="tech-select"
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
          >
            {currentUser.technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.status})
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Setting the technician automatically locks the ETA status to "20 mins" and prompts the mechanic.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssign}>
              Assign & Dispatches
            </Button>
          </div>
        </div>
      </Modal>

      {/* STATUS CHANGER MODAL */}
      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title="Update Repair Status">
        {selectedRequest && (
          <div className="space-y-5">
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1 text-left">
              <p>👤 **Customer:** {selectedRequest.userName}</p>
              <p>🛠️ **Category:** {selectedRequest.category}</p>
              <p>⏱️ **Current ETA:** {selectedRequest.eta}</p>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Button
                variant={selectedRequest.status === "on_the_way" ? "primary" : "outline"}
                className="h-10 text-xs px-2"
                onClick={() => handleConfirmStatus("on_the_way")}
              >
                On The Way
              </Button>
              <Button
                variant={selectedRequest.status === "repair_in_progress" ? "primary" : "outline"}
                className="h-10 text-xs px-2"
                onClick={() => handleConfirmStatus("repair_in_progress")}
              >
                In Progress
              </Button>
              <Button
                variant={selectedRequest.status === "completed" ? "primary" : "outline"}
                className="col-span-2 h-10 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleConfirmStatus("completed")}
              >
                Mark Job Completed
              </Button>
            </div>

            {/* Custom ETA input if setting on the way */}
            <div className="border-t border-border pt-4 text-left">
              <Input
                label="Modify Dispatch ETA (Optional)"
                placeholder="e.g. 15 mins, Arrived"
                value={customEta}
                onChange={(e) => setCustomEta(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setIsStatusOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
