import { useEffect, useState } from "react";
import { format } from "date-fns";
import { listAdminUsers, updateAdminUserStatus, type AdminUser } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Search, Ban, ShieldAlert, Building2, Users, Filter, CheckCircle2, XCircle } from "lucide-react";

const STATUS_OPTIONS = ["active", "pending", "suspended", "banned"] as const;
const ACCOUNT_TYPES = ["member", "influencer", "featured", "partner", "vip", "enterprise"] as const;
const PLAN_OPTIONS = ["starter", "pro", "elite", "enterprise"] as const;

export function OwnerAdminPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("enterprise"); // Default to enterprise
  const [showAllUsers, setShowAllUsers] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await listAdminUsers();
      setUsers(result.users);
    } catch (error) {
      toast({ title: "Could not load admin users", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (userId: number, accountStatus: string, planTier?: string) => {
    setUpdatingId(userId);
    try {
      await updateAdminUserStatus(userId, accountStatus, planTier);
      toast({ title: "Status updated", description: "The account status has been changed." });
      await load();
    } catch (error) {
      toast({ title: "Could not update status", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const banUser = async (userId: number) => {
    setUpdatingId(userId);
    try {
      await updateAdminUserStatus(userId, "banned", undefined);
      toast({ title: "User banned", description: "The account has been banned.", variant: "destructive" });
      await load();
    } catch (error) {
      toast({ title: "Could not ban user", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const unbanUser = async (userId: number) => {
    setUpdatingId(userId);
    try {
      await updateAdminUserStatus(userId, "active", undefined);
      toast({ title: "User unbanned", description: "The account has been reactivated." });
      await load();
    } catch (error) {
      toast({ title: "Could not unban user", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      searchQuery === "" ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toString().includes(searchQuery);
    
    const matchesStatus = filterStatus === "all" || user.accountStatus === filterStatus;
    const matchesPlan = filterPlan === "all" || user.planTier === filterPlan;
    
    // If not showing all users, only show enterprise by default
    const matchesDefaultFilter = showAllUsers || user.planTier === "enterprise";
    
    return matchesSearch && matchesStatus && matchesPlan && matchesDefaultFilter;
  });

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Enterprise Account Management
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showAllUsers 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white"
              }`}
            >
              {showAllUsers ? "Showing All Users" : "Enterprise Only"}
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-500">Manage enterprise accounts, approve requests, ban/suspend users, and update account statuses.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/30 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/30 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-black/30 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Plans</option>
              {PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-zinc-400">
            Total: <span className="text-white font-medium">{users.length}</span>
          </span>
          <span className="text-zinc-400">
            Enterprise: <span className="text-primary font-medium">{users.filter(u => u.planTier === "enterprise").length}</span>
          </span>
          <span className="text-zinc-400">
            Pending: <span className="text-yellow-400 font-medium">{users.filter(u => u.accountStatus === "pending").length}</span>
          </span>
          <span className="text-zinc-400">
            Banned: <span className="text-red-400 font-medium">{users.filter(u => u.accountStatus === "banned").length}</span>
          </span>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-zinc-500">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No users found matching your criteria</p>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{user.displayName}</p>
                      {user.isOwner ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                          Owner
                        </span>
                      ) : null}
                      {!user.isOwner && user.accountStatus ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                          {user.accountStatus}
                        </span>
                      ) : null}
                      {!user.isOwner && user.planTier ? (
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                          {user.planTier}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{user.email} · {user.role}</p>
                    <p className="text-xs text-zinc-500">Joined {format(new Date(user.joinedAt), "MMM d, yyyy")}</p>
                  </div>
                  {!user.isOwner ? (
                    <div className="flex flex-col gap-3">
                      {/* Account Status Actions */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-500 w-full">Status:</span>
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            disabled={updatingId == user.id || user.accountStatus === status}
                            onClick={() => void updateStatus(Number(user.id), status, user.planTier)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                              user.accountStatus === status
                                ? status === "banned"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : "bg-primary/20 text-primary border border-primary/30"
                                : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {updatingId == user.id && user.accountStatus !== status ? "..." : (
                              <>
                                {status === "active" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                {status === "banned" && <Ban className="w-3 h-3 inline mr-1" />}
                                {status === "suspended" && <ShieldAlert className="w-3 h-3 inline mr-1" />}
                                {status === "pending" && <XCircle className="w-3 h-3 inline mr-1" />}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Account Type/Plan */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-500 w-full">Account Type:</span>
                        {ACCOUNT_TYPES.map((type) => (
                          <button
                            key={type}
                            disabled={updatingId == user.id}
                            onClick={() => void updateStatus(Number(user.id), user.accountStatus || "active", type === "enterprise" ? "enterprise" : user.planTier)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                              (user.accountStatus === type || user.planTier === type)
                                ? "bg-accent/20 text-accent border border-accent/30"
                                : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Quick Ban/Unban */}
                      {user.accountStatus !== "banned" ? (
                        <button
                          onClick={() => void banUser(Number(user.id))}
                          disabled={updatingId == user.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" />
                          Ban Account
                        </button>
                      ) : (
                        <button
                          onClick={() => void unbanUser(Number(user.id))}
                          disabled={updatingId == user.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Unban Account
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
