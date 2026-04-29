import { supabase } from "@/lib/supabase";

export type MessageThreadSummary = {
  id: number;
  counterpart: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: number;
    body: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
  updatedAt: string;
};

export type MessageThreadDetail = {
  id: number;
  counterpart: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  messages: Array<{
    id: number;
    body: string;
    senderId: number;
    isRead: boolean;
    createdAt: string;
  }>;
};

export async function listMessageThreads(search?: string): Promise<{ threads: MessageThreadSummary[] }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get threads where user is participant
  const { data: participations, error: partError } = await supabase
    .from('message_thread_participants')
    .select('thread_id')
    .eq('user_id', user.id);

  if (partError) throw partError;
  if (!participations?.length) return { threads: [] };

  const threadIds = participations.map(p => p.thread_id);

  // Get thread details with last message
  const { data: threads, error } = await supabase
    .from('message_threads')
    .select(`
      id,
      updated_at,
      message_thread_participants!inner(user_id, profiles:user_id(id, username, display_name, avatar_url)),
      messages!message_thread_id_fkey(id, body, created_at, sender_id, is_read)
    `)
    .in('id', threadIds)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const formattedThreads: MessageThreadSummary[] = threads?.map(thread => {
    const otherParticipant = thread.message_thread_participants
      ?.find((p: any) => p.user_id !== user.id);
    
    const lastMsg = thread.messages?.[0];
    const unreadCount = thread.messages?.filter((m: any) => m.sender_id !== user.id && !m.is_read).length || 0;

    return {
      id: thread.id,
      counterpart: otherParticipant ? {
        id: otherParticipant.profiles?.id,
        username: otherParticipant.profiles?.username,
        displayName: otherParticipant.profiles?.display_name,
        avatarUrl: otherParticipant.profiles?.avatar_url,
      } : null,
      lastMessage: lastMsg ? {
        id: lastMsg.id,
        body: lastMsg.body,
        createdAt: lastMsg.created_at,
        senderId: lastMsg.sender_id,
      } : null,
      unreadCount,
      updatedAt: thread.updated_at,
    };
  }) || [];

  return { threads: formattedThreads };
}

export async function getMessageThread(threadId: number): Promise<{ thread: MessageThreadDetail }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check user is participant
  const { data: participation } = await supabase
    .from('message_thread_participants')
    .select('user_id')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .single();

  if (!participation) throw new Error("Not authorized to view this thread");

  // Get thread with all messages
  const { data: thread, error } = await supabase
    .from('message_threads')
    .select(`
      id,
      message_thread_participants!inner(user_id, profiles:user_id(id, username, display_name, avatar_url)),
      messages!message_thread_id_fkey(id, body, sender_id, is_read, created_at)
    `)
    .eq('id', threadId)
    .single();

  if (error) throw error;

  const otherParticipant = thread.message_thread_participants
    ?.find((p: any) => p.user_id !== user.id);

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('thread_id', threadId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  return {
    thread: {
      id: thread.id,
      counterpart: otherParticipant ? {
        id: otherParticipant.profiles?.id,
        username: otherParticipant.profiles?.username,
        displayName: otherParticipant.profiles?.display_name,
        avatarUrl: otherParticipant.profiles?.avatar_url,
      } : null,
      messages: thread.messages?.map((m: any) => ({
        id: m.id,
        body: m.body,
        senderId: m.sender_id,
        isRead: m.is_read,
        createdAt: m.created_at,
      })) || [],
    },
  };
}

export async function createMessageThread(participantId: number, message?: string): Promise<{ threadId: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if thread already exists
  const { data: existing } = await supabase
    .from('message_thread_participants')
    .select('thread_id')
    .eq('user_id', user.id);

  const userThreads = existing?.map(e => e.thread_id) || [];

  if (userThreads.length > 0) {
    const { data: otherParticipant } = await supabase
      .from('message_thread_participants')
      .select('thread_id')
      .eq('user_id', participantId)
      .in('thread_id', userThreads);

    const commonThread = otherParticipant?.[0]?.thread_id;
    if (commonThread) {
      // Thread exists, add message if provided
      if (message) {
        await supabase.from('messages').insert({
          thread_id: commonThread,
          sender_id: user.id,
          body: message,
        });
      }
      return { threadId: commonThread };
    }
  }

  // Create new thread
  const { data: thread, error } = await supabase
    .from('message_threads')
    .insert({})
    .select('id')
    .single();

  if (error || !thread) throw error || new Error("Failed to create thread");

  // Add participants
  await supabase.from('message_thread_participants').insert([
    { thread_id: thread.id, user_id: user.id },
    { thread_id: thread.id, user_id: participantId },
  ]);

  // Add initial message if provided
  if (message) {
    await supabase.from('messages').insert({
      thread_id: thread.id,
      sender_id: user.id,
      body: message,
    });
  }

  return { threadId: thread.id };
}

export async function sendThreadMessage(threadId: number, body: string): Promise<{ message: { id: number; body: string; senderId: number; isRead: boolean; createdAt: string } }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      body,
    })
    .select('id, body, sender_id, is_read, created_at')
    .single();

  if (error || !message) throw error || new Error("Failed to send message");

  // Update thread updated_at
  await supabase
    .from('message_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId);

  return {
    message: {
      id: message.id,
      body: message.body,
      senderId: message.sender_id,
      isRead: message.is_read,
      createdAt: message.created_at,
    },
  };
}
