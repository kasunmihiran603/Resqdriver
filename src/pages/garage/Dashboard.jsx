import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Wrench,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ArrowRight
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
  const { requests } = useRequests();
  const navigate = useNavigate();

  // Filter requests that belong to this garage, or are pending in general (available to accept)
  const garageRequests = requests.filter((r) => r.garageId === currentUser.id);
  const pendingQueue = requests.filter((r) => r.status === "pending" && !r.garageId && !r.towingId);
  const activeJobs = garageRequests.filter((r) => r.status !== "completed" && r.status !== "pending");
  const completedJobs = garageRequests.filter((r) => r.status === "completed");

  // Sum revenue
  const totalRevenue = completedJobs.reduce((acc, curr) => {
    const numeric = parseFloat(curr.fee.replace(/[$,]/g, "")) || 0;
    return acc + numeric;
  }, 0);

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
              <p className="text-2xl font-black text-foreground">${totalRevenue.toFixed(2)}</p>
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

    </div>
  );
};
