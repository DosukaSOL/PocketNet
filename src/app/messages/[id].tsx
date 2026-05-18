import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, Button, Row, Stack } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMessaging } from '@/features/messaging/MessagingProvider';
import { usePocketData } from '@/features/social/SocialProvider';
import { isOnline, presenceLabel } from '@/lib/presence';
import { supabase } from '@/lib/supabase';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threadId = String(id);
  const { profile } = useAuth();
  const { messagesByThread, threads, loadThread, sendMessage, markThreadRead } = useMessaging();
  const { getProfile } = usePocketData();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const thread = useMemo(() => threads.find((item) => item.id === threadId), [threadId, threads]);
  const otherId = thread && profile
    ? thread.participantAId === profile.id
      ? thread.participantBId
      : thread.participantAId
    : undefined;
  const other = otherId ? getProfile(otherId) : undefined;
  const messages = messagesByThread[threadId] ?? [];

  useEffect(() => {
    void loadThread(threadId);
    void markThreadRead(threadId);
  }, [loadThread, markThreadRead, threadId]);

  // Realtime: subscribe to new messages on this thread for live updates.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel(`dm-thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `thread_id=eq.${threadId}`
        },
        () => {
          void loadThread(threadId);
          void markThreadRead(threadId);
        }
      )
      .subscribe();
    return () => {
      void supabase!.removeChannel(channel);
    };
  }, [loadThread, markThreadRead, threadId]);

  const onSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setDraft('');
    try {
      await sendMessage(threadId, trimmed);
    } catch {
      // Restore the draft so the user can retry.
      setDraft(trimmed);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [draft, sending, sendMessage, threadId]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Row style={styles.header}>
        <Button label="Back" icon={ArrowLeft} compact variant="ghost" onPress={() => router.back()} />
        <Row style={{ flex: 1, gap: spacing.sm, alignItems: 'center' }}>
          <View style={{ position: 'relative' }}>
            <Avatar uri={other?.avatarUrl} size={36} label={other?.displayName ?? '?'} />
            {isOnline(other?.lastSeenAt) ? <View style={styles.onlineDot} /> : null}
          </View>
          <Stack gap={1} style={{ flex: 1 }}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {other?.displayName ?? 'PocketNet player'}
            </AppText>
            <AppText variant="metadata" color={colors.textMuted}>
              {presenceLabel(other?.lastSeenAt)}
            </AppText>
          </Stack>
        </Row>
        {other ? (
          <Button
            label="View"
            compact
            variant="ghost"
            onPress={() => router.push(`/user/${other.id}`)}
          />
        ) : null}
      </Row>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.senderId === profile?.id;
            return (
              <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <AppText style={mine ? styles.textMine : styles.textTheirs}>{item.body}</AppText>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Stack style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
              <AppText color={colors.textMuted}>No messages yet. Send the first one.</AppText>
            </Stack>
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            maxLength={2000}
            editable={!sending}
            onSubmitEditing={onSend}
          />
          <Button
            label="Send"
            icon={Send}
            onPress={onSend}
            loading={sending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlow
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background
  },
  list: {
    padding: spacing.md,
    gap: spacing.xs,
    paddingBottom: spacing.lg
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs
  },
  bubbleRowMine: {
    justifyContent: 'flex-end'
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg
  },
  bubbleMine: {
    backgroundColor: colors.accentCyan,
    borderBottomRightRadius: 4
  },
  bubbleTheirs: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4
  },
  textMine: {
    color: '#001018',
    ...typography.body,
    fontWeight: '600'
  },
  textTheirs: {
    color: colors.textPrimary,
    ...typography.body
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlow,
    backgroundColor: colors.background
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    ...typography.body
  }
});
