import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { api, type AiChatHistoryItem } from '@/lib/api';
import {
  type ChatMessage,
  type Conversation,
  deriveTitle,
  loadConversations,
  makeConversation,
  newId,
  saveConversations,
} from '@/lib/ai-storage';
import { Markdown } from '@/components/Markdown';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, notifyError } from '@/lib/haptics';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SUGGESTION_CARDS: { icon: IconName; title: string; prompt: string }[] = [
  {
    icon: 'trending-up',
    title: 'Youth Unemployment',
    prompt:
      'What are youth unemployment trends across African regions? Which countries have improved the most?',
  },
  {
    icon: 'school',
    title: 'Education Access',
    prompt:
      'Compare youth education enrollment rates across the 5 African regions and identify the key gaps.',
  },
  {
    icon: 'heart',
    title: 'Health Metrics',
    prompt:
      'Show key youth health indicators across Africa — HIV prevalence, child mortality, and healthcare access.',
  },
  {
    icon: 'trophy',
    title: 'Top Performers',
    prompt:
      'Which 10 countries rank highest on the African Youth Index and what drives their success?',
  },
  {
    icon: 'globe-outline',
    title: 'Regional Analysis',
    prompt:
      'Give me a regional breakdown of youth development indicators across all 5 African sub-regions.',
  },
  {
    icon: 'document-text',
    title: 'Generate Report',
    prompt:
      'Generate a comprehensive structured report on African youth development with data tables, key findings, and recommendations.',
  },
];

export default function AskAIScreen() {
  const colors = useThemeColors();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? 'anon';
      setUserId(id);
      const loaded = await loadConversations(id);
      setConversations(loaded);
      if (loaded.length > 0) setActiveId(loaded[0].id);
    })();
  }, []);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const persist = (next: Conversation[]) => {
    setConversations(next);
    if (userId) {
      saveConversations(userId, next).catch(() => undefined);
    }
  };

  const startNew = () => {
    const c = makeConversation();
    const next = [c, ...conversations];
    persist(next);
    setActiveId(c.id);
    setDrawerOpen(false);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    tapLight();
    setDraft('');

    let conv = active;
    if (!conv) {
      conv = makeConversation();
      setActiveId(conv.id);
      setConversations((prev) => [conv!, ...prev]);
    }

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    const updated = (cs: Conversation[]) =>
      cs.map((c) =>
        c.id === conv!.id
          ? {
              ...c,
              title: c.messages.length === 0 ? deriveTitle(trimmed) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c,
      );

    persist(updated(conversations.length > 0 ? conversations : [conv]));
    setBusy(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const history: AiChatHistoryItem[] = (conv.messages ?? [])
        .filter((m) => !m.error)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await api.ai.chat({ message: trimmed, history });
      const assistantMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: res.answer,
        followUps: res.followUpQuestions,
        createdAt: Date.now(),
      };
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === conv!.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c,
        );
        if (userId) saveConversations(userId, next).catch(() => undefined);
        return next;
      });
    } catch (err) {
      notifyError();
      const errMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content:
          err instanceof Error
            ? `I couldn't reach the AI service: ${err.message}`
            : "I couldn't reach the AI service. Please try again.",
        error: true,
        createdAt: Date.now(),
      };
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === conv!.id
            ? { ...c, messages: [...c.messages, errMsg], updatedAt: Date.now() }
            : c,
        );
        if (userId) saveConversations(userId, next).catch(() => undefined);
        return next;
      });
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const deleteConversation = (id: string) => {
    const next = conversations.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
    }
  };

  const messages = active?.messages ?? [];
  const showEmpty = messages.length === 0 && !busy;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Pressable onPress={() => setDrawerOpen(true)} hitSlop={8} className="p-1">
          <Ionicons name="menu" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="font-display text-base font-semibold text-foreground" numberOfLines={1}>
          {active?.title ?? 'Ask AI'}
        </Text>
        <Pressable onPress={startNew} hitSlop={8} className="p-1">
          <Ionicons name="create-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="px-4 py-5 pb-2"
          keyboardShouldPersistTaps="handled"
        >
          {showEmpty ? (
            <WelcomeScreen onSuggestion={send} />
          ) : (
            <View className="gap-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onPressFollowUp={send} />
              ))}
              {busy && <TypingIndicator />}
            </View>
          )}
        </ScrollView>

        <View className="border-t border-border px-3 py-2">
          <View className="flex-row items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask about African youth data..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              className="max-h-32 flex-1 py-1 text-base text-foreground"
              onSubmitEditing={() => send(draft)}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send(draft)}
              disabled={!draft.trim() || busy}
              className={`h-9 w-9 items-center justify-center rounded-xl ${
                draft.trim() && !busy ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Ionicons
                name={busy ? 'ellipsis-horizontal' : 'arrow-up'}
                size={16}
                color={
                  draft.trim() && !busy ? colors.primaryForeground : colors.mutedForeground
                }
              />
            </Pressable>
          </View>
          <Text className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </Text>
        </View>
      </KeyboardAvoidingView>

      <ConversationsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setDrawerOpen(false);
        }}
        onNew={startNew}
        onDelete={deleteConversation}
      />
    </SafeAreaView>
  );
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  const colors = useThemeColors();
  return (
    <View className="py-10">
      <View className="items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Ionicons name="sparkles" size={26} color={colors.primary} />
        </View>
        <Text className="mt-4 font-display text-xl font-bold text-foreground">
          Ask anything about African Youth
        </Text>
        <Text className="mt-2 max-w-[42ch] text-center text-sm leading-5 text-muted-foreground">
          Explore data from 54 countries, generate reports, compare regions, and uncover
          insights powered by Claude AI.
        </Text>
      </View>

      <View className="mt-8 gap-3">
        {SUGGESTION_CARDS.map(({ icon, title, prompt }) => (
          <Pressable
            key={title}
            onPress={() => onSuggestion(prompt)}
            className="flex-row items-start gap-3 rounded-xl border border-border bg-card p-4 active:bg-muted"
          >
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Ionicons name={icon} size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{title}</Text>
              <Text className="mt-0.5 text-xs leading-4 text-muted-foreground" numberOfLines={2}>
                {prompt}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  onPressFollowUp,
}: {
  message: ChatMessage;
  onPressFollowUp: (text: string) => void;
}) {
  const colors = useThemeColors();
  const isUser = message.role === 'user';
  return (
    <View className={isUser ? 'items-end' : 'items-start'}>
      <View
        className={`max-w-[88%] flex-row gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <View
          className={`mt-0.5 h-7 w-7 items-center justify-center rounded-full ${
            isUser ? 'bg-primary' : 'bg-pan-green-500/15'
          }`}
        >
          <Ionicons
            name={isUser ? 'person' : 'sparkles'}
            size={13}
            color={isUser ? colors.primaryForeground : colors.primary}
          />
        </View>

        <View
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5'
              : message.error
              ? 'rounded-2xl rounded-tl-sm border border-destructive/30 bg-destructive/10 px-3.5 py-2.5'
              : 'flex-1 rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5'
          }
        >
          {isUser ? (
            <Text className="text-sm text-primary-foreground" style={{ lineHeight: 20 }}>
              {message.content}
            </Text>
          ) : message.error ? (
            <Text className="text-sm text-destructive">{message.content}</Text>
          ) : (
            <Markdown text={message.content} />
          )}
        </View>
      </View>

      {!isUser && message.followUps && message.followUps.length > 0 ? (
        <View className="ml-9 mt-3 w-[88%] gap-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Follow-up
          </Text>
          {message.followUps.slice(0, 3).map((f) => (
            <Pressable
              key={f}
              onPress={() => onPressFollowUp(f)}
              className="rounded-xl border border-border bg-card px-3 py-2 active:bg-muted"
            >
              <Text className="text-sm text-foreground">{f}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TypingIndicator() {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-pan-green-500/15">
        <Ionicons name="sparkles" size={13} color={colors.primary} />
      </View>
      <View className="rounded-2xl border border-border bg-card px-3 py-2.5">
        <View className="flex-row items-center gap-1.5">
          <ActivityIndicator size="small" color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground">Thinking…</Text>
        </View>
      </View>
    </View>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

function ConversationsDrawer({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const colors = useThemeColors();
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [open, slide, fade]);

  if (!mounted) return null;

  return (
    <View
      pointerEvents={open ? 'auto' : 'none'}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: fade,
        }}
      >
        <Pressable onPress={onClose} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.card,
          transform: [{ translateX: slide }],
        }}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="font-display text-base font-semibold text-foreground">Chats</Text>
            <Pressable onPress={onNew} hitSlop={8} className="flex-row items-center gap-1">
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text className="text-sm font-semibold text-primary">New</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="px-2 py-2">
            {conversations.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-sm text-muted-foreground">No conversations yet</Text>
              </View>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <View
                    key={c.id}
                    className={`mb-1 flex-row items-center rounded-xl px-3 py-2.5 ${
                      isActive ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Pressable onPress={() => onSelect(c.id)} className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-sm ${
                          isActive ? 'font-semibold text-primary' : 'text-foreground'
                        }`}
                      >
                        {c.title}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {c.messages.length} messages
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(c.id)} hitSlop={6} className="p-1">
                      <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
