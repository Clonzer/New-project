import { useEffect, useState } from "react";
import { format } from "date-fns";
import { listAdminUsers, updateAdminUserStatus, type AdminUser } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { NeonButton } from "@/components/ui/neon-button";

const STATUS_OPTIONS = ["member", "influencer", "featured", "partner", "vip"] as const;

export function OwnerAdminPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const updateStatus = async (userId: number, accountStatus: string) => {
    setUpdatingId(userId);
    try {
      await updateAdminUserStatus(userId, accountStatus);
      toast({ title: "Internal status updated", description: "The account status has been changed." });
      await load();
    } catch (error) {
      toast({ title: "Could not update status", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-white">Owner admin panel</h2>
        <p className="text-sm text-zinc-500 mt-1">Only owner accounts can see this. Update internal statuses like influencer or featured here.</p>
      </div>
      <div className="p-6">
        {loading ? (
          <p className="text-zinc-500">Loading users...</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
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
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{user.email} · {user.role}</p>
                    <p className="text-xs text-zinc-500">Joined {format(new Date(user.joinedAt), "MMM d, yyyy")}</p>
                  </div>
                  {!user.isOwner ? (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <NeonButton
                          key={status}
                          glowColor={user.accountStatus === status ? "primary" : "white"}
                          className="rounded-full px-4 py-2 text-xs"
                          disabled={updatingId === user.id}
                          onClick={() => void updateStatus(user.id, status)}
                        >
                          {updatingId === user.id && user.accountStatus !== status ? "Updating..." : status}
                        </NeonButton>
                      ))}
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
