import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Users,
  ShieldCheck,
  Wrench,
  Truck,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertTriangle
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
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();

  // Load all registered users from localStorage to count
  const allUsers = JSON.parse(localStorage.getItem("vamp-users") || "[]");
  
  const driversCount = allUsers.filter((u) => u.role === "user").length;
  const garagesCount = allUsers.filter((u) => u.role === "garage").length;
  const towingCount = allUsers.filter((u) => u.role === "towing").length;

  const activeIncidents = requests.filter((r) => r.status !== "completed");
  const completedIncidents = requests.filter((r) => r.status === "completed");

  // Sum system-wide estimated fees
  const systemFees = requests.reduce((acc, curr) => {
    const numeric = parseFloat(curr.fee.replace(/[$,]/g, "")) || 0;
    return acc + numeric;
  }, 0);

  // Group incidents by category for charts
  const categoryCounts = requests.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map((key, idx) => {
    const colors = ["#3b82f6", "#eab308", "#10b981", "#f43f5e", "#f97316", "#64748b"];
    return {
      name: key,
      value: categoryCounts[key],
      color: colors[idx % colors.length]
    };
  });

  // Mock global weekly requests chart
  const systemTrends = [
    { week: "Wk 1", drivers: 40, tows: 22, garages: 12 },
    { week: "Wk 2", drivers: 60, tows: 35, garages: 18 },
    { week: "Wk 3", drivers: 75, tows: 40, garages: 22 },
    { week: "Wk 4", drivers: 92, tows: 55, garages: 31 }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Platform Control Center</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Logged in as {currentUser.name} (Global Administrator)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/users")} size="sm">
            Control User Accounts
          </Button>
          <Button onClick={() => navigate("/admin/services")} size="sm">
            Monitor Feeds
          </Button>
        </div>
      </div>

      {/* Global stats grids */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Drivers On-Network</span>
              <p className="text-2xl font-black text-foreground">{driversCount}</p>
              <span className="text-[10px] text-blue-500 font-bold block">Active registrations</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Active Garages</span>
              <p className="text-2xl font-black text-foreground">{garagesCount}</p>
              <span className="text-[10px] text-emerald-500 font-bold block">Verified workshops</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Wrench size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Towing Operatives</span>
              <p className="text-2xl font-black text-foreground">{towingCount}</p>
              <span className="text-[10px] text-purple-500 font-bold block">Flatbeds registered</span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Truck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Gross System Fees</span>
              <p className="text-2xl font-black text-foreground">${systemFees.toFixed(2)}</p>
              <span className="text-[10px] text-rose-500 font-bold block">Cumulative network value</span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <Activity size={20} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual analytics plots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly signups */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Account Growth</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Registrations Trajectory</h3>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="drivers" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDrivers)" name="Drivers Registered" />
                <Area type="monotone" dataKey="tows" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0} name="Towing Rigs" />
                <Area type="monotone" dataKey="garages" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Workshops" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents Pie Chart split */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Incident Classifications</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Emergency Log Categories</h3>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-center items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Labels list */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-muted-foreground mt-2 w-full px-2">
                  {pieData.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="truncate">{s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-12">
                No incidents reported on network.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Incidents logs preview */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-500">Live Traffic Control</CardTitle>
            <h3 className="text-base font-bold text-foreground mt-0.5">Active Emergencies Feed</h3>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {activeIncidents.length > 0 ? (
              activeIncidents.slice(0, 4).map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-xs text-foreground">{req.category} — {req.userName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      📍 {req.location} • Status: <span className="text-primary font-bold">{req.status}</span>
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate("/admin/services")} className="h-8 text-[11px] px-2.5">
                    View Logs
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No active emergencies in system. All clear!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick System Auditing Feed */}
        <Card className="border-border/80 text-xs text-left">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold">Audit Operations Log</CardTitle>
            <CardDescription>Real-time system lifecycle updates</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">User auth db initialized</p>
                <span className="text-[9px] text-muted-foreground">System seed completed</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">Apex Auto Care accepted req-1</p>
                <span className="text-[9px] text-muted-foreground">Mechanic dispatched</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">Towing flatbed tow-1 active</p>
                <span className="text-[9px] text-muted-foreground">Accident recovery lock</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
