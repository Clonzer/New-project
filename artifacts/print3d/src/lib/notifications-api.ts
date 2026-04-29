import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "order"
  | "order_update"
  | "contest_update"
  | "contest_winner"
  | "system"
  | "message";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  url: string | null;
  isRead: boolean;
  createdAt: string;
  actorId: number | null;
};

export async function listNotifications(limit?: number, offset?: number): Promise<{ notifications: NotificationItem[] }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [] };

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 20) - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [] };
  }

  const notifications: NotificationItem[] = (data || []).map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    url: n.url,
    isRead: n.is_read,
    createdAt: n.created_at,
    actorId: n.actor_id,
  }));

  return { notifications };
}

export async function getUnreadNotificationsCount(): Promise<{ unreadCount: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { unreadCount: 0 };

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    return { unreadCount: 0 };
  }

  return { unreadCount: count || 0 };
}

export async function markNotificationRead(notificationId: number): Promise<{ ok: true }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<{ ok: true }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
  return { ok: true };
}
