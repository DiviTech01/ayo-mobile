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
import { api } from '@/lib/api';
import {
  type ChatMessage,
  type Conversation,
  deriveTitle,
  loadConversations,
  makeConversation,
  newId,
  saveConversations,
} from '@/lib/ai-storage';

const SUGGESTIONS = [
  'How does Nigeria compare to Kenya on youth literacy?',
  'Which African countries have ratified the AYC?',
  'Show youth unemployment trends in West Africa',
  'What is the AYEMI score for Ghana?',
];

export default function AskAIScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? 'anon';
      setUserId(id);
      const loaded = loadConversations(id);
      setConversations(loaded);
      if (loaded.length > 0) setActiveId(loaded[0].id);
    });
  }, []);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const persist = (next: Conversation[]) => {
    setConversations(next);
    if (userId) saveConversations(userId, next);
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
      const res = await api.query.ask(trimmed);
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
        if (userId) saveConversations(userId, next);
        return next;
      });
    } catch (err) {
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
        if (userId) saveConversations(userId, next);
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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => setDrawerOpen(true)} hitSlop={8} className="p-1">
          <Ionicons name="menu" size={22} color="#111827" />
        </Pressable>
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {active?.title ?? 'Ask AI'}
        </Text>
        <Pressable onPress={startNew} hitSlop={8} className="p-1">
          <Ionicons name="create-outline" size={22} color="#111827" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="px-4 py-4 pb-2"
          keyboardShouldPersistTaps="handled"
        >
          {showEmpty ? (
            <View className="py-10">
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-pan-blue-50">
                  <Ionicons name="sparkles" size={28} color="#0284c7" />
                </View>
                <Text className="mt-4 text-xl font-semibold text-gray-900">
                  Ask AfYO anything
                </Text>
                <Text className="mt-1 text-center text-sm text-gray-500">
                  Natural-language queries on the African Youth Observatory dataset.
                </Text>
              </View>
              <View className="mt-8 gap-2">
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 active:bg-gray-100"
                  >
                    <Text className="text-sm text-gray-700">{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View className="gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onPressFollowUp={send} />
              ))}
              {busy && <TypingIndicator />}
            </View>
          )}
        </ScrollView>

        <View className="border-t border-gray-100 px-3 py-2">
          <View className="flex-row items-end gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
            <Pressable hitSlop={6} className="pb-1">
              <Ionicons name="attach" size={20} color="#9ca3af" />
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask a question..."
              placeholderTextColor="#9ca3af"
              multiline
              className="max-h-32 flex-1 py-1 text-base text-gray-900"
              onSubmitEditing={() => send(draft)}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send(draft)}
              disabled={!draft.trim() || busy}
              className={`h-8 w-8 items-center justify-center rounded-full ${
                draft.trim() && !busy ? 'bg-pan-blue-600' : 'bg-gray-200'
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={16}
                color={draft.trim() && !busy ? 'white' : '#9ca3af'}
              />
            </Pressable>
          </View>
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

function MessageBubble({
  message,
  onPressFollowUp,
}: {
  message: ChatMessage;
  onPressFollowUp: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <View className={isUser ? 'items-end' : 'items-start'}>
      <View
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-pan-blue-600 px-4 py-2.5'
            : message.error
            ? 'max-w-[90%] rounded-2xl rounded-bl-md border border-pan-red-200 bg-pan-red-50 px-4 py-2.5'
            : 'max-w-[90%]'
        }
      >
        <Text
          className={
            isUser
              ? 'text-base text-white'
              : message.error
              ? 'text-sm text-pan-red-700'
              : 'text-base leading-6 text-gray-900'
          }
        >
          {message.content}
        </Text>
      </View>

      {!isUser && message.followUps && message.followUps.length > 0 ? (
        <View className="mt-3 w-full gap-1.5">
          <Text className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
            Follow-up
          </Text>
          {message.followUps.slice(0, 3).map((f) => (
            <Pressable
              key={f}
              onPress={() => onPressFollowUp(f)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 active:bg-gray-50"
            >
              <Text className="text-sm text-gray-700">{f}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TypingIndicator() {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-pan-blue-50">
        <Ionicons name="sparkles" size={14} color="#0284c7" />
      </View>
      <View className="rounded-2xl bg-gray-100 px-3 py-2">
        <ActivityIndicator size="small" color="#6b7280" />
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
          ...StyleSheetFlatten({ flex: 1 }),
          backgroundColor: '#0009',
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
          backgroundColor: 'white',
          transform: [{ translateX: slide }],
        }}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Text className="text-base font-semibold text-gray-900">Chats</Text>
            <Pressable onPress={onNew} hitSlop={8} className="flex-row items-center gap-1">
              <Ionicons name="create-outline" size={18} color="#0284c7" />
              <Text className="text-sm font-semibold text-pan-blue-600">New</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="px-2 py-2">
            {conversations.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-sm text-gray-500">No conversations yet</Text>
              </View>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <View
                    key={c.id}
                    className={`mb-1 flex-row items-center rounded-xl px-3 py-2.5 ${
                      isActive ? 'bg-pan-blue-50' : ''
                    }`}
                  >
                    <Pressable onPress={() => onSelect(c.id)} className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-sm ${
                          isActive ? 'font-semibold text-pan-blue-700' : 'text-gray-800'
                        }`}
                      >
                        {c.title}
                      </Text>
                      <Text className="text-[10px] text-gray-400">
                        {c.messages.length} messages
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(c.id)} hitSlop={6} className="p-1">
                      <Ionicons name="trash-outline" size={14} color="#9ca3af" />
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

function StyleSheetFlatten<T>(s: T): T {
  return s;
}
