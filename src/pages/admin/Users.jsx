import React, { useState, useEffect } from "react";
import api from "../../context/api";
import { useToast } from "../../context/ToastContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Users, ShieldAlert, CheckCircle, ShieldX, Search } from "lucide-react";

export const AdminUsers = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users");
      setUserList(res.data || []);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (userId) => {
    const user = userList.find((u) => u.id === userId);
    if (!user) return;

    const nextSuspended = !user.suspended;
    try {
      await api.put(⁠ /api/users / ${ userId } ⁠, { suspended: nextSuspended });
      setUserList(userList.map((u) => u.id === userId ? { ...u, suspended: nextSuspended } : u));
      showToast(
        nextSuspended ? ⁠ Suspended account for ${ user.name }. ⁠ : ⁠ Restored access for ${ user.name }. ⁠,
      nextSuspended ? "error" : "success"
      );
    } catch (err) {
  showToast("Failed to update user status", "error");
}
  };

const filteredUsers = userList.filter((u) => {
  const text = searchTerm.toLowerCase();
  return (
    (u.name && u.name.toLowerCase().includes(text)) ||
    (u.email && u.email.toLowerCase().includes(text)) ||
    (u.role && u.role.toLowerCase().includes(text))
  );
});

const roleColors = {
  user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  garage: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  towing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  admin: "bg-rose-500/10 text-rose-500 border-rose-500/20"
};

return (
  <div className="space-y-6 text-left">
    <div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">User Management Accounts</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Suspend, audit, and verify accounts registered on the VAMP network.</p>
    </div>

    {/* Filter bar */}
    <div className="relative max-w-md">
      <Input
        placeholder="Search accounts by name, email, or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Search size={16} />
      </div>
    </div>

    {/* Accounts list */}
    <Card className="border-border/80">
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-16 text-xs text-muted-foreground">
            Loading users...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border font-bold text-[10px] uppercase text-muted-foreground tracking-wider">
                  <th className="p-4">Account Representative</th>
                  <th className="p-4">Contact Email</th>
                  <th className="p-4">Network Role</th>
                  <th className="p-4">Platform Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        {u.name}
                        {u.ownerName && <p className="text-[10px] text-muted-foreground font-normal">Owner: {u.ownerName}</p>}
                      </td>
                      <td className="p-4 font-semibold text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <span className={⁠ px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${roleColors[u.role]} ⁠}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.suspended ? (
                          <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-black uppercase">
                            Suspended
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            variant={u.suspended ? "outline" : "destructive"}
                            className="h-8 text-xs px-2.5"
                            onClick={() => handleToggleSuspend(u.id)}
                          >
                            {u.suspended ? "Restore Access" : "Suspend Account"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
            </div>
      ) : (
      <div className="text-center py-16 text-xs text-muted-foreground">
        No accounts match the search term.
      </div>
          )}
    </CardContent>
  </Card>
    </div >
  );
};