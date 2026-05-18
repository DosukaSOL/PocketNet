import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { DirectMessage, DirectThread, ID } from '@/types/domain';

type MessagingContextValue = {
  threads: DirectThread[];
  messagesByThread: Record<ID, DirectMessage[]>;
  isLoading: boolean;
  refreshThreads: () => Promise<void>;
  loadThread: (threadId: ID) => Promise<DirectMessage[]>;
  openThreadWith: (otherUserId: ID) => Promise<ID | null>;
  sendMessage: (threadId: ID, body: string) => Promise<void>;
  markThreadRead: (threadId: ID) => Promise<void>;
  totalUnread: number;
};

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

type ThreadRow = {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  last_message_at: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function threadFromRow(row: ThreadRow): DirectThread {
  return {
    id: String(row.id),
    participantAId: String(row.participant_a_id),
    participantBId: String(row.participant_b_id),
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : undefined,
    createdAt: String(row.created_at),
    unreadCount: 0
  };
}

function messageFromRow(row: MessageRow): DirectMessage {
  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    senderId: String(row.sender_id),
    body: String(row.body ?? ''),
    readAt: row.read_at ? String(row.read_at) : undefined,
    createdAt: String(row.created_at)
  };
}

export function MessagingProvider({ children }: PropsWithChildren) {
  const { session, profile } = useAuth();
  const userId = profile?.id ?? session?.user.id;
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<ID, DirectMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  const refreshThreads = useCallback(async () => {
    if (!supabase || !userId) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dm_threads')
        .select('*')
        .or(`participant_a_id.eq.${userId},participant_b_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error || !data) {
        return;
      }

      const baseThreads = (data as ThreadRow[]).map(threadFromRow);
      if (!baseThreads.length) {
        setThreads([]);
        return;
      }

      const threadIds = baseThreads.map((thread) => thread.id);
      const { data: msgRows } = await supabase
        .from('dm_messages')
        .select('*')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false });

      const messages = ((msgRows ?? []) as MessageRow[]).map(messageFromRow);
      const grouped: Record<ID, DirectMessage[]> = {};
      messages.forEach((message) => {
        const list = grouped[message.threadId] ?? [];
        list.push(message);
        grouped[message.threadId] = list;
      });

      const enriched = baseThreads.map((thread) => {
        const list = grouped[thread.id] ?? [];
        const last = list[0];
        const unread = list.filter(
          (message) => message.senderId !== userId && !message.readAt
        ).length;
        return {
          ...thread,
          lastMessage: last,
          unreadCount: unread
        };
      });

      setThreads(enriched);
      // Cache messages sorted oldest-first for thread view.
      setMessagesByThread((prev) => {
        const next = { ...prev };
        Object.keys(grouped).forEach((threadId) => {
          next[threadId] = [...grouped[threadId]].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadThread = useCallback(
    async (threadId: ID) => {
      if (!supabase || !userId) {
        return [];
      }
      const { data } = await supabase
        .from('dm_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      const list = ((data ?? []) as MessageRow[]).map(messageFromRow);
      setMessagesByThread((prev) => ({ ...prev, [threadId]: list }));
      return list;
    },
    [userId]
  );

  const openThreadWith = useCallback(
    async (otherUserId: ID) => {
      if (!supabase || !userId) {
        return null;
      }
      const { data, error } = await supabase.rpc('find_or_create_dm_thread', {
        other_user_id: otherUserId
      });
      if (error || !data) {
        return null;
      }
      const threadId = String(data);
      await refreshThreads();
      return threadId;
    },
    [refreshThreads, userId]
  );

  const sendMessage = useCallback(
    async (threadId: ID, body: string) => {
      if (!supabase || !userId) {
        return;
      }
      const trimmed = body.trim();
      if (!trimmed) {
        return;
      }
      const optimistic: DirectMessage = {
        id: `optimistic-${Date.now()}`,
        threadId,
        senderId: userId,
        body: trimmed,
        createdAt: new Date().toISOString()
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), optimistic]
      }));

      const { data, error } = await supabase
        .from('dm_messages')
        .insert({ thread_id: threadId, sender_id: userId, body: trimmed })
        .select('*')
        .single();

      if (error || !data) {
        // Roll back the optimistic insert.
        setMessagesByThread((prev) => ({
          ...prev,
          [threadId]: (prev[threadId] ?? []).filter((message) => message.id !== optimistic.id)
        }));
        throw error ?? new Error('Could not send message.');
      }

      const persisted = messageFromRow(data as MessageRow);
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: (prev[threadId] ?? []).map((message) =>
          message.id === optimistic.id ? persisted : message
        )
      }));
      void refreshThreads();
    },
    [refreshThreads, userId]
  );

  const markThreadRead = useCallback(
    async (threadId: ID) => {
      if (!supabase || !userId) {
        return;
      }
      const nowIso = new Date().toISOString();
      await supabase
        .from('dm_messages')
        .update({ read_at: nowIso })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)
        .is('read_at', null);

      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: (prev[threadId] ?? []).map((message) =>
          message.senderId === userId || message.readAt ? message : { ...message, readAt: nowIso }
        )
      }));
      setThreads((items) =>
        items.map((thread) => (thread.id === threadId ? { ...thread, unreadCount: 0 } : thread))
      );
    },
    [userId]
  );

  // Realtime: subscribe to new messages so threads auto-update.
  useEffect(() => {
    if (!supabase || !userId) {
      return;
    }

    void refreshThreads();

    const channel = supabase
      .channel(`dm-inbox-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dm_messages' },
        () => {
          void refreshThreads();
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      void supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [refreshThreads, userId]);

  // Refresh when the app comes back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshThreads();
      }
    });
    return () => sub.remove();
  }, [refreshThreads]);

  const totalUnread = useMemo(
    () => threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [threads]
  );

  const value = useMemo<MessagingContextValue>(
    () => ({
      threads,
      messagesByThread,
      isLoading,
      refreshThreads,
      loadThread,
      openThreadWith,
      sendMessage,
      markThreadRead,
      totalUnread
    }),
    [
      isLoading,
      loadThread,
      markThreadRead,
      messagesByThread,
      openThreadWith,
      refreshThreads,
      sendMessage,
      threads,
      totalUnread
    ]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    throw new Error('useMessaging must be used inside MessagingProvider');
  }
  return ctx;
}
