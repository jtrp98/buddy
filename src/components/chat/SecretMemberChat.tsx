"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  MessageCircle,
  PauseCircle,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { PixelAvatar } from "@/components/join/PixelAvatar";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  LoadingState,
  Textarea,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

interface ChatMember {
  id: string;
  displayName: string;
  avatarSeed: string;
  publicMessageCount: number;
  publicLastMessage: string | null;
}

interface InboxDmThread {
  id: string;
  visitorKey: string;
  visitorCodename: string;
  visitorAvatarSeed: string;
  messageCount: number;
  lastMessage: string | null;
  updatedAt: string;
}

interface ChatBootstrap {
  me: {
    id: string;
    displayName: string;
    codename: string;
    avatarSeed: string;
  };
  group: {
    id: string;
    title: string;
    status: string;
  };
  members: ChatMember[];
  inboxDmThreads: InboxDmThread[];
}

interface ChatMessageItem {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  isOwner: boolean;
  senderLabel: string;
  avatarSeed: string;
}

const POLL_INTERVAL_MS = 12_000;
const IDLE_TIMEOUT_MS = 6 * 60 * 1000;

export function SecretMemberChat({ token }: { token: string }) {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState<ChatBootstrap | null>(null);

  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [mode, setMode] = useState<"PUBLIC_ROOM" | "PRIVATE_DM">("PUBLIC_ROOM");
  const [selectedDmVisitorKey, setSelectedDmVisitorKey] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [idlePaused, setIdlePaused] = useState(false);
  const lastActivityRef = useRef<number>(0);
  const listBottomRef = useRef<HTMLDivElement | null>(null);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdlePaused(false);
  }, []);

  const loadBootstrap = useCallback(async () => {
    try {
      const res = await fetch("/api/members/chat", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "ไม่สามารถโหลดห้องแชตลับได้");
        setLoading(false);
        return;
      }
      const typed = json as ChatBootstrap;
      setBootstrap(typed);
      setSelectedTargetId((prev) => {
        if (prev) return prev;
        const firstOther = typed.members.find((m) => m.id !== typed.me.id);
        return firstOther?.id ?? typed.me.id;
      });
      setLoading(false);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLoading(false);
    }
  }, [token]);

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!selectedTargetId) return;
      if (!silent) setLoadingMessages(true);
      try {
        const params = new URLSearchParams({
          targetMemberId: selectedTargetId,
          mode,
        });
        if (mode === "PRIVATE_DM" && selectedDmVisitorKey) {
          params.set("visitorKey", selectedDmVisitorKey);
        }
        const res = await fetch(`/api/members/chat/messages?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        setMessages((json.messages ?? []) as ChatMessageItem[]);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [token, selectedTargetId, mode, selectedDmVisitorKey]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members/chat", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "ไม่สามารถโหลดห้องแชตลับได้");
          setLoading(false);
          return;
        }
        const typed = json as ChatBootstrap;
        setBootstrap(typed);
        setSelectedTargetId((prev) => {
          if (prev) return prev;
          const firstOther = typed.members.find((m) => m.id !== typed.me.id);
          return firstOther?.id ?? typed.me.id;
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedTargetId) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          targetMemberId: selectedTargetId,
          mode,
        });
        if (mode === "PRIVATE_DM" && selectedDmVisitorKey) {
          params.set("visitorKey", selectedDmVisitorKey);
        }
        const res = await fetch(`/api/members/chat/messages?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!cancelled) {
          setMessages((json.messages ?? []) as ChatMessageItem[]);
          setLoadingMessages(false);
        }
      } catch {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedTargetId, mode, selectedDmVisitorKey]);

  // Track user interaction for 6-minute idle auto-pause (saves Neon Compute)
  useEffect(() => {
    lastActivityRef.current = Date.now();
    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, []);

  // Visibility-aware polling + 6-min idle auto-pause
  useEffect(() => {
    if (!bootstrap || idlePaused) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        setIdlePaused(true);
        return;
      }
      loadMessages(true);
      loadBootstrap();
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden && Date.now() - lastActivityRef.current < IDLE_TIMEOUT_MS) {
        loadMessages(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bootstrap, idlePaused, loadMessages, loadBootstrap]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !selectedTargetId || sending) return;
    markActivity();
    triggerClickSound();
    setSending(true);
    setSendError("");

    try {
      const res = await fetch("/api/members/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetMemberId: selectedTargetId,
          mode,
          ...(mode === "PRIVATE_DM" && selectedDmVisitorKey
            ? { visitorKey: selectedDmVisitorKey }
            : {}),
          content: draft.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSendError(json.error || "ไม่สามารถส่งข้อความได้");
        return;
      }
      triggerChimeSound();
      setDraft("");
      setMessages((prev) => [...prev, json.message as ChatMessageItem]);
      window.setTimeout(() => {
        listBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 50);
    } catch {
      setSendError("เกิดข้อผิดพลาดในการส่งข้อความ");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingState label="กำลังเปิดห้องโทรเลขขั้วโลกเหนือ..." rows={5} />;
  }

  if (error || !bootstrap) {
    return <Alert tone="error">{error || "ไม่สามารถโหลดข้อมูลได้"}</Alert>;
  }

  const selectedMember =
    bootstrap.members.find((m) => m.id === selectedTargetId) ?? bootstrap.members[0];
  const isMyOwnRoom = selectedTargetId === bootstrap.me.id;
  const isCompleted = bootstrap.group.status === "COMPLETED";

  const canReplyInDm =
    mode !== "PRIVATE_DM" || !isMyOwnRoom || Boolean(selectedDmVisitorKey);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
            North Pole Telegraph • {bootstrap.group.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
            ห้องแชตลับ &amp; ปั่นเพื่อน
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            ฉายานิรนามของคุณในกลุ่มนี้คือ{" "}
            <strong className="text-gold">{bootstrap.me.codename}</strong>
          </p>
        </div>

        <Link
          href={`/me/profile?token=${encodeURIComponent(token)}`}
          className={christmasButtonClass("secondary", "sm")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>กลับหน้าโปรไฟล์</span>
        </Link>
      </div>

      {idlePaused && (
        <Alert tone="info">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <PauseCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>หยุดอัปเดตแชตอัตโนมัติชั่วคราว (ไม่มีการใช้งานเกิน 6 นาที)</span>
            </span>
            <ChristmasButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                markActivity();
                loadMessages(true);
                loadBootstrap();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>เชื่อมต่อแชตต่อ</span>
            </ChristmasButton>
          </div>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar: Members + Inbox DMs */}
        <ChristmasCard className="space-y-4 p-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span>เลือกห้องของเพื่อน ({bootstrap.members.length})</span>
            </p>
            <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {bootstrap.members.map((m) => {
                const active = selectedTargetId === m.id && !selectedDmVisitorKey;
                const isMe = m.id === bootstrap.me.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      markActivity();
                      triggerClickSound();
                      setSelectedTargetId(m.id);
                      setSelectedDmVisitorKey("");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                      active
                        ? "border-primary bg-primary/15 text-text-primary"
                        : "border-transparent bg-surface-elevated/40 text-text-secondary hover:border-border-default hover:text-text-primary"
                    }`}
                  >
                    <PixelAvatar seed={m.avatarSeed} px={2} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">
                        {m.displayName} {isMe ? "(ห้องฉัน)" : ""}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {m.publicMessageCount > 0
                          ? `${m.publicMessageCount} ข้อความในห้องปั่น`
                          : "ยังไม่มีข้อความ"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border-default pt-3">
            <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-accent-light uppercase">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>DM ลับที่ทักหาคุณ ({bootstrap.inboxDmThreads.length})</span>
            </p>
            {bootstrap.inboxDmThreads.length === 0 ? (
              <p className="mt-1.5 text-[11px] text-text-muted">
                ยังไม่มีใครทักแชตลับ 1-ต่อ-1 หาคุณ
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {bootstrap.inboxDmThreads.map((t) => {
                  const active =
                    selectedTargetId === bootstrap.me.id &&
                    mode === "PRIVATE_DM" &&
                    selectedDmVisitorKey === t.visitorKey;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        markActivity();
                        triggerClickSound();
                        setSelectedTargetId(bootstrap.me.id);
                        setMode("PRIVATE_DM");
                        setSelectedDmVisitorKey(t.visitorKey);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-accent bg-accent/15 text-text-primary"
                          : "border-transparent bg-surface-elevated/40 text-text-secondary hover:border-border-default"
                      }`}
                    >
                      <PixelAvatar seed={t.visitorAvatarSeed} px={2} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">{t.visitorCodename}</p>
                        <p className="truncate text-[11px] text-text-muted">
                          {t.lastMessage || `${t.messageCount} ข้อความ`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ChristmasCard>

        {/* Right Chat Window */}
        <ChristmasCard elevated className="flex min-h-[480px] flex-col p-4 sm:p-5">
          {/* Header & Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-3">
            <div className="flex items-center gap-2.5">
              {selectedMember && <PixelAvatar seed={selectedMember.avatarSeed} px={2} />}
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  {selectedMember ? `ห้องของ ${selectedMember.displayName}` : "เลือกห้องแชต"}
                </h2>
                <p className="text-[11px] text-text-muted">
                  {mode === "PUBLIC_ROOM"
                    ? "1 ต่อ Many — ทุกคนในกลุ่มเข้ามาอ่านและปั่นร่วมกันได้"
                    : "1 ต่อ 1 — เห็นเฉพาะคุณกับเจ้าของห้อง (ไม่เปิดเผยชื่อผู้ทัก)"}
                </p>
              </div>
            </div>

            <div className="flex rounded-xl border border-border-default bg-surface p-1">
              <button
                type="button"
                onClick={() => {
                  markActivity();
                  triggerClickSound();
                  setMode("PUBLIC_ROOM");
                  setSelectedDmVisitorKey("");
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === "PUBLIC_ROOM"
                    ? "bg-primary text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>ห้องปั่นรวม</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  markActivity();
                  triggerClickSound();
                  setMode("PRIVATE_DM");
                  if (isMyOwnRoom && !selectedDmVisitorKey && bootstrap.inboxDmThreads[0]) {
                    setSelectedDmVisitorKey(bootstrap.inboxDmThreads[0].visitorKey);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mode === "PRIVATE_DM"
                    ? "bg-accent text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>แชตลับ 1-ต่อ-1</span>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-1 max-h-[380px]">
            {loadingMessages ? (
              <p className="py-12 text-center text-xs text-text-muted">กำลังโหลดข้อความ...</p>
            ) : !canReplyInDm ? (
              <div className="py-12 text-center text-xs text-text-muted">
                เลือกผู้ทักจากเมนู &quot;DM ลับที่ทักหาคุณ&quot; ทางซ้ายเพื่ออ่านและตอบกลับ
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-text-muted/60" aria-hidden="true" />
                <p className="mt-2 text-xs text-text-muted">
                  ยังไม่มีข้อความในห้องนี้ เริ่มเปิดประเดิมข้อความแรกได้เลย!
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.isMine ? "flex-row-reverse" : ""}`}
                >
                  <PixelAvatar seed={m.avatarSeed} px={2} />
                  <div
                    className={`max-w-[78%] rounded-2xl border px-3.5 py-2.5 text-sm ${
                      m.isMine
                        ? "border-primary/40 bg-primary/15 text-text-primary"
                        : m.isOwner
                          ? "border-gold/40 bg-gold/10 text-text-primary"
                          : "border-border-default bg-surface-elevated/80 text-text-primary"
                    }`}
                  >
                    <p className="text-[11px] font-bold text-text-secondary">
                      {m.senderLabel} {m.isMine ? "• คุณ" : ""}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={listBottomRef} />
          </div>

          {/* Input Form */}
          {isCompleted ? (
            <Alert tone="info">กิจกรรมนี้จบลงแล้ว ห้องแชตอยู่ในโหมดอ่านอย่างเดียว</Alert>
          ) : (
            <form onSubmit={handleSend} className="space-y-2 border-t border-border-default pt-3">
              {sendError && <Alert tone="error">{sendError}</Alert>}
              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  maxLength={500}
                  disabled={!canReplyInDm || sending}
                  value={draft}
                  onChange={(e) => {
                    markActivity();
                    setDraft(e.target.value);
                  }}
                  placeholder={
                    !canReplyInDm
                      ? "เลือกห้อง DM ทางซ้ายก่อนตอบกลับ..."
                      : mode === "PUBLIC_ROOM"
                        ? `พิมพ์ปั่นในห้องของ ${selectedMember?.displayName ?? ""} (แสดงเป็น ${bootstrap.me.codename})...`
                        : `ส่งข้อความลับ 1-ต่อ-1 ถึง ${selectedMember?.displayName ?? ""}...`
                  }
                  className="flex-1 resize-none"
                />
                <ChristmasButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!canReplyInDm || !draft.trim() || sending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{sending ? "ส่ง..." : "ส่ง"}</span>
                </ChristmasButton>
              </div>
            </form>
          )}
        </ChristmasCard>
      </div>
    </div>
  );
}
