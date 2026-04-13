import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, listNotifications, NotificationItem } from "@/lib/notifications-api";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    void listNotifications(50, 0)
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleMarkAll = async () => {
    setIsMarking(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-4 py-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <h1 className="text-3xl font-display font-bold text-white">Notifications</h1>
                  <p className="text-sm text-zinc-400">Stay on top of orders, contest updates, and messages.</p>
                </div>
              </div>
            </div>
            <Button disabled={isLoading || isMarking} onClick={handleMarkAll}>
              Mark all read
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-8 text-center text-zinc-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center text-zinc-400">
                You're all caught up. New updates will appear here when activity happens.
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`glass-panel rounded-3xl border p-6 transition-shadow ${
                    notification.isRead ? "border-white/10 bg-white/5" : "border-primary/30 bg-primary/10 shadow-lg"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-400 uppercase tracking-[0.18em] mb-2">{notification.type.replace("_", " ")}</p>
                      <h2 className="text-lg font-semibold text-white">{notification.title}</h2>
                    </div>
                    <span className="text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-4 text-zinc-300 leading-relaxed">{notification.body}</p>
                  {notification.url ? (
                    <div className="mt-5">
                      <Button asChild variant="secondary">
                        <a href={notification.url}>View details</a>
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
