import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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
import { useTranslation } from '@/lib/i18n';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SUGGESTIONS: { icon: IconName; label: string; prompt: string }[] = [
  {
    icon: 'trending-up',
    label: 'Youth unemployment trends',
    prompt:
      'What are youth unemployment trends across African regions? Which countries have improved the most?',
  },
  {
    icon: 'school',
    label: 'Education access gaps',
    prompt:
      'Compare youth education enrollment rates across the 5 African regions and identify the key gaps.',
  },
  {
    icon: 'trophy',
    label: 'Top Youth Index performers',
    prompt:
      'Which 10 countries rank highest on the African Youth Index and what drives their success?',
  },
  {
    icon: 'document-text',
    label: 'Generate a data report',
    prompt:
      'Generate a comprehensive structured report on African youth development with data tables, key findings, and recommendations.',
  },
];

export default function AskAIScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
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
    if (userId) saveConversations(userId, next).catch(() => undefined);
  };

  const startNew = () => {
    tapLight();
    const c = makeConversation();
    persist([c, ...conversations]);
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
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const renameConversation = (id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    persist(
      conversations.map((c) =>
        c.id === id ? { ...c, title: clean, updatedAt: Date.now() } : c,
      ),
    );
  };

  const messages = active?.messages ?? [];
  const showEmpty = messages.length === 0 && !busy;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Minimal header */}
      <View className="flex-row items-center justify-between px-3 py-2.5">
        <Pressable
          onPress={() => setDrawerOpen(true)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <Ionicons name="menu" size={22} color={colors.foreground} />
        </Pressable>
        <Text
          className="flex-1 text-center font-display text-[15px] font-semibold text-foreground"
          numberOfLines={1}
        >
          {active?.title ?? t('ai.title')}
        </Text>
        <Pressable
          onPress={startNew}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <Ionicons name="create-outline" size={21} color={colors.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="px-4 pt-2 pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showEmpty ? (
            <WelcomeScreen onSuggestion={send} />
          ) : (
            <View className="gap-6 pt-2">
              {messages.map((m) => (
                <Turn key={m.id} message={m} onPressFollowUp={send} />
              ))}
              {busy ? <ThinkingRow /> : null}
            </View>
          )}
        </ScrollView>

        {/* Floating composer */}
        <View className="px-3 pb-3 pt-1">
          <View className="flex-row items-end gap-2 rounded-[26px] border border-border bg-card px-2 py-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('ai.placeholder')}
              placeholderTextColor={colors.mutedForeground}
              multiline
              className="max-h-32 flex-1 px-3 py-2 text-[15px] text-foreground"
              onSubmitEditing={() => send(draft)}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send(draft)}
              disabled={!draft.trim() || busy}
              className={`mb-0.5 h-9 w-9 items-center justify-center rounded-full ${
                draft.trim() && !busy ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={
                  draft.trim() && !busy ? colors.primaryForeground : colors.mutedForeground
                }
              />
            </Pressable>
          </View>
          <Text className="mt-1.5 text-center text-[10px] text-muted-foreground">
            {t('ai.grounded')}
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
        onRename={renameConversation}
      />
    </SafeAreaView>
  );
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  return (
    <View className="flex-1 justify-center px-2 py-16">
      <View className="items-center">
        <View
          style={{ backgroundColor: 'rgba(212,160,23,0.14)' }}
          className="h-16 w-16 items-center justify-center rounded-2xl"
        >
          <Ionicons name="sparkles" size={28} color="#D4A017" />
        </View>
        <Text className="mt-5 text-center font-display text-2xl font-bold text-foreground">
          {t('ai.howCanIHelp')}
        </Text>
        <Text className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-muted-foreground">
          {t('ai.welcomeDesc')}
        </Text>
      </View>

      <View className="mt-9 gap-2.5">
        {SUGGESTIONS.map(({ icon, label, prompt }) => (
          <Pressable
            key={label}
            onPress={() => onSuggestion(prompt)}
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3.5 active:bg-muted"
          >
            <Ionicons name={icon} size={17} color={colors.mutedForeground} />
            <Text className="flex-1 text-[14px] text-foreground">{label}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Turn({
  message,
  onPressFollowUp,
}: {
  message: ChatMessage;
  onPressFollowUp: (text: string) => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View className="items-end">
        <View
          style={{ backgroundColor: colors.muted }}
          className="max-w-[85%] rounded-3xl rounded-br-lg px-4 py-2.5"
        >
          <Text className="text-[15px] text-foreground" style={{ lineHeight: 22 }}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View
          style={{ backgroundColor: 'rgba(212,160,23,0.14)' }}
          className="h-6 w-6 items-center justify-center rounded-full"
        >
          <Ionicons name="sparkles" size={12} color="#D4A017" />
        </View>
        <Text className="text-[12px] font-semibold text-muted-foreground">
          AfYO AI
        </Text>
      </View>

      <View className="mt-2 pl-8">
        {message.error ? (
          <Text className="text-[15px] text-destructive" style={{ lineHeight: 22 }}>
            {message.content}
          </Text>
        ) : (
          <Markdown text={message.content} />
        )}

        {!message.error && message.followUps && message.followUps.length > 0 ? (
          <View className="mt-4 gap-1.5 border-t border-border/50 pt-3">
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('ai.suggestedFollowUps')}
            </Text>
            {message.followUps.slice(0, 3).map((f) => (
              <Pressable
                key={f}
                onPress={() => onPressFollowUp(f)}
                className="flex-row items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5 active:bg-muted"
              >
                <Ionicons name="arrow-forward-circle-outline" size={14} color={colors.primary} />
                <Text className="flex-1 text-[13px] text-foreground">{f}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ThinkingRow() {
  const colors = useThemeColors();
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, {
            toValue: 1,
            duration: 360,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0.3,
            duration: 360,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View
          style={{ backgroundColor: 'rgba(212,160,23,0.14)' }}
          className="h-6 w-6 items-center justify-center rounded-full"
        >
          <Ionicons name="sparkles" size={12} color="#D4A017" />
        </View>
        <Text className="text-[12px] font-semibold text-muted-foreground">
          AfYO AI
        </Text>
      </View>
      <View className="mt-2.5 flex-row items-center gap-1.5 pl-8">
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: colors.mutedForeground,
              opacity: d,
            }}
          />
        ))}
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
  onRename,
}: {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
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
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', opacity: fade }}>
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
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <Text className="font-display text-base font-semibold text-foreground">
              {t('ai.chats')}
            </Text>
            <Pressable
              onPress={onNew}
              hitSlop={8}
              className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5"
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text className="text-[13px] font-semibold text-primary">
                {t('ai.newChat')}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="px-2 py-1">
            {conversations.length === 0 ? (
              <View className="items-center py-12">
                <Ionicons
                  name="chatbubbles-outline"
                  size={26}
                  color={colors.mutedForeground}
                />
                <Text className="mt-2 text-sm text-muted-foreground">
                  {t('ai.noConversations')}
                </Text>
              </View>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <View
                    key={c.id}
                    className={`mb-1 flex-row items-center rounded-xl px-3 py-3 ${
                      isActive ? 'bg-primary/10' : 'active:bg-muted'
                    }`}
                  >
                    <Pressable onPress={() => onSelect(c.id)} className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-[14px] ${
                          isActive ? 'font-semibold text-primary' : 'text-foreground'
                        }`}
                      >
                        {c.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-muted-foreground">
                        {c.messages.length} message{c.messages.length === 1 ? '' : 's'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        tapLight();
                        setRenameText(c.title);
                        setRenaming(c);
                      }}
                      hitSlop={6}
                      className="h-7 w-7 items-center justify-center rounded-md active:bg-muted"
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={14}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => onDelete(c.id)}
                      hitSlop={6}
                      className="h-7 w-7 items-center justify-center rounded-md active:bg-muted"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {renaming ? (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="items-center justify-center px-8"
        >
          <Pressable
            onPress={() => setRenaming(null)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            className="bg-black/55"
          />
          <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
            <Text className="font-display text-base font-bold text-foreground">
              {t('ai.renameChat')}
            </Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              placeholder={t('ai.renameChat')}
              placeholderTextColor={colors.mutedForeground}
              className="mt-4 rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] text-foreground"
              onSubmitEditing={() => {
                if (renameText.trim()) {
                  onRename(renaming.id, renameText);
                  setRenaming(null);
                }
              }}
            />
            <View className="mt-4 flex-row justify-end gap-2">
              <Pressable
                onPress={() => setRenaming(null)}
                className="rounded-xl border border-border px-4 py-2.5 active:bg-muted"
              >
                <Text className="text-[14px] font-semibold text-foreground">
                  {t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (renameText.trim()) {
                    onRename(renaming.id, renameText);
                    setRenaming(null);
                  }
                }}
                disabled={!renameText.trim()}
                style={!renameText.trim() ? { opacity: 0.5 } : undefined}
                className="rounded-xl bg-primary px-4 py-2.5 active:opacity-80"
              >
                <Text className="text-[14px] font-semibold text-primary-foreground">
                  {t('common.save')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
