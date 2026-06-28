import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Wrench,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Landmark,
  ArrowDownCircle,
  History
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

export const GarageDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, transactions, withdrawGarageBalance } = useRequests();
  const { showToast } = useToast();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

  const parseFee = (feeStr) => {
    if (!feeStr) return 0;
    return parseFloat(feeStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Filter requests that belong to this garage, or are pending in general (available to accept)
  const garageRequests = requests.filter((r) => r.garageId === currentUser.id);
  const pendingQueue = requests.filter((r) => r.status === "pending" && !r.garageId && !r.towingId);
  const activeJobs = garageRequests.filter((r) => r.status !== "completed" && r.status !== "pending");
  const completedJobs = garageRequests.filter((r) => r.status === "completed");

  const paidJobs = completedJobs.filter((r) => r.paymentStatus === "paid");
  const unpaidJobs = completedJobs.filter((r) => r.paymentStatus === "unpaid");

  // Sum revenue
  const totalRevenue = completedJobs.reduce((acc, curr) => {
    const numeric = parseFee(curr.fee);
    return acc + numeric;
  }, 0);

  // Sum earned revenue (completed and paid)
  const garageEarnings = paidJobs.reduce((acc, curr) => {
    const numeric = parseFee(curr.fee);
    return acc + numeric;
  }, 0);

  // Sum pending payments (completed and unpaid)
  const pendingCustomerPayments = unpaidJobs.reduce((acc, curr) => {
    const numeric = parseFee(curr.fee);
    return acc + numeric;
  }, 0);

  const [withdrawnTotal, setWithdrawnTotal] = useState(() => {
    return parseFloat(localStorage.getItem(`vamp-garage-withdrawn-${currentUser.id}`) || "0");
  });

  const availableBalance = Math.max(0, garageEarnings - withdrawnTotal);

  const handleWithdraw = () => {
    if (availableBalance <= 0) {
      showToast("No available earnings to withdraw.", "warning");
      return;
    }
    withdrawGarageBalance(currentUser.id);
    const newWithdrawn = withdrawnTotal + availableBalance;
    setWithdrawnTotal(newWithdrawn);
    localStorage.setItem(`vamp-garage-withdrawn-${currentUser.id}`, newWithdrawn.toString());
    showToast(`Withdrawal of ${formatAmount(availableBalance)} completed to your bank.`, "success");
  };

  // Filter transactions for this garage
  const garageTransactions = transactions.filter((t) => t.garageId === currentUser.id);

  // Mock data for Recharts trends
  const trendData = [
    { day: "Mon", requests: 3, completed: 2 },
    { day: "Tue", requests: 5, completed: 4 },
    { day: "Wed", requests: 2, completed: 2 },
    { day: "Thu", requests: 8, completed: 5 },
    { day: "Fri", requests: 6, completed: 6 },
    { day: "Sat", requests: 9, completed: 7 },
    { day: "Sun", requests: 4, completed: 4 }
  ];

  // Technician workloads chart data
  const techData = currentUser?.technicians?.map((t) => {
    // count how many active requests are assigned to this technician
    const activeJobsCount = activeJobs.filter((r) => r.technician?.id === t.id).length;
    return { name: t.name, jobs: activeJobsCount, status: t.status };
  }) || [];

  // Pie chart status distribution
  const statusSplit = [
    { name: "Pending In Area", value: pendingQueue.length, color: "#eab308" },
    { name: "Active Assigned", value: activeJobs.length, color: "#3b82f6" },
    { name: "Completed Cases", value: completedJobs.length, color: "#10b981" }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Welcome & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{currentUser.name} Center</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Logged in as {currentUser.ownerName} (Garage Owner)</p>
        </div>
        <Button onClick={() => navigate("/garage/requests")} className="flex items-center gap-1">
          Open Request Queue <ArrowRight size={16} />
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Incident Queue</span>
              <p className="text-2xl font-black text-foreground">{pendingQueue.length}</p>
              <span className="text-[10px] text-yellow-500 font-bold block">Awaiting Acceptance</span>
            </div>
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <Clock size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Active Repair Jobs</span>
              <p className="text-2xl font-black text-foreground">{activeJobs.length}</p>
              <span className="text-[10px] text-blue-500 font-bold block">In Progress</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Wrench size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Completed Work</span>
              <p className="text-2xl font-black text-foreground">{completedJobs.length}</p>
              <span className="text-[10px] text-emerald-500 font-bold block">Resolved incident logs</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Estimated Earnings</span>
              <p className="text-2xl font-black text-foreground">{formatAmount(totalRevenue)}</p>
              <span className="text-[10px] text-primary font-bold block">Based on base service fees</span>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DollarSign size={22} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Request & Resolution Trends */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Incident Trends</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Weekly Intake & Clearance Rate</h3>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReq)" name="Incoming Requests" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Resolved Cases" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Status distribution pie */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Status Allocation</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Work Distribution</h3>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={statusSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legends */}
            <div className="flex gap-4 text-[10px] font-bold text-muted-foreground mt-2">
              {statusSplit.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Technician workload load bar chart */}
        <Card className="lg:col-span-1 border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Technician Workloads</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Active Job Allocation</h3>
          </CardHeader>
          <CardContent className="h-60">
            {techData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={14} name="Active Jobs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-12">
                No technicians registered.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Pending Incidents preview */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-500">Urgent Board</CardTitle>
              <h3 className="text-base font-bold text-foreground mt-0.5">Nearby Unclaimed Incident Calls</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/garage/requests")} className="text-primary font-bold text-xs p-1">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {pendingQueue.length > 0 ? (
              pendingQueue.slice(0, 3).map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-xs text-foreground">{req.category}</p>
                    <p className="text-[10px] text-muted-foreground">
                      📍 {req.location} • Vehicle: {req.vehicle.make} {req.vehicle.model}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/garage/requests")} className="h-8 text-xs px-3">
                    Claim Job
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No active pending requests in service zone.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Financial Overview & Payments Section */}
      <div className="space-y-3 text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Financial Ledger & Withdrawals</h3>
        
        {/* Earnings Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Total Earnings</span>
                <p className="text-2xl font-black text-foreground">{formatAmount(garageEarnings)}</p>
                <span className="text-[10px] text-emerald-500 font-bold block">Paid incident settlements</span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <DollarSign size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Pending Payments</span>
                <p className="text-2xl font-black text-foreground">{formatAmount(pendingCustomerPayments)}</p>
                <span className="text-[10px] text-rose-500 font-bold block">Awaiting customer clearance</span>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                <Clock size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Completed Payments</span>
                <p className="text-2xl font-black text-foreground">{paidJobs.length}</p>
                <span className="text-[10px] text-primary font-bold block">Successful clearings</span>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <CheckCircle size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary/[0.01]">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Withdrawable Balance</span>
                  <p className="text-xl font-black text-foreground">{formatAmount(availableBalance)}</p>
                </div>
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Landmark size={18} />
                </div>
              </div>
              <Button onClick={handleWithdraw} disabled={availableBalance <= 0} size="sm" className="w-full h-8 text-[11px] font-bold mt-1.5 flex items-center justify-center gap-1">
                <ArrowDownCircle size={13} /> Withdraw Balance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment History Table */}
        <Card className="border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold text-foreground">Settlement History Logs</CardTitle>
            <CardDescription>Ledger of clearing updates on completed client requests.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {garageTransactions.length > 0 ? (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-y border-border/50 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Client</th>
                        <th className="p-4">Vehicle</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {garageTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 font-bold text-foreground">{t.id}</td>
                          <td className="p-4 text-muted-foreground">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="p-4 font-semibold text-foreground">{t.userName}</td>
                          <td className="p-4 text-muted-foreground">{t.vehicle}</td>
                          <td className="p-4 font-bold text-foreground">{formatAmount(parseFee(t.amount))}</td>
                          <td className="p-4 text-muted-foreground">{t.paymentMethod}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y divide-border/60">
                  {garageTransactions.map((t) => (
                    <div key={t.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-foreground">{t.id}</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-1 text-muted-foreground">
                        <p>Client: <span className="font-semibold text-foreground">{t.userName}</span></p>
                        <p>Vehicle: <span className="text-foreground">{t.vehicle}</span></p>
                        <p>Method: <span className="text-foreground">{t.paymentMethod}</span></p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                        <span className="font-bold text-foreground text-xs">{formatAmount(parseFee(t.amount))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No past settlements logged for your workshop.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
