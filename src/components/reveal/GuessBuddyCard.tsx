"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, HelpCircle, Sparkles, Trophy, UserCheck } from "lucide-react";
import { Alert, ChristmasButton, ChristmasCard, Select } from "@/components/ui/ChristmasUI";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatThaiDateTime } from "@/lib/timezone";

interface Candidate {
  id: string;
  displayName: string;
}

interface GuessState {
  status: string;
  revealAt: string | null;
  guessOpen: boolean;
  isOpen: boolean;
  candidates: Candidate[];
  myGuess: {
    guessedGiverId: string;
    updatedAt: string;
  } | null;
  completedResult: {
    actualGiverName: string | null;
    isCorrect: boolean;
    totalGuesses: number;
    correctCount: number;
  } | null;
}

export function GuessBuddyCard({ token }: { token: string }) {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const [state, setState] = useState<GuessState | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/members/guess", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GuessState | null) => {
        if (cancelled || !data) return;
        setState(data);
        if (data.myGuess?.guessedGiverId) {
          setSelectedId(data.myGuess.guessedGiverId);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!state) return null;
  if (state.status !== "ACTIVE" && state.status !== "COMPLETED") return null;

  const handleVote = async () => {
    if (!selectedId) return;
    triggerClickSound();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/members/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guessedGiverId: selectedId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "ไม่สามารถบันทึกคำทายได้");
        return;
      }
      triggerChimeSound();
      setState((prev) => (prev ? { ...prev, myGuess: json.myGuess } : prev));
      setMessage("บันทึกคำทายของคุณแล้ว! สามารถเปลี่ยนได้จนกว่ากิจกรรมจะจบ");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const currentGuessedName =
    state.candidates.find((c) => c.id === state.myGuess?.guessedGiverId)?.displayName ?? null;

  return (
    <ChristmasCard className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-gold">
          {state.status === "COMPLETED" ? (
            <Trophy className="h-5 w-5" aria-hidden="true" />
          ) : (
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
            Guess My Buddy
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-text-primary">
            ทายสิ... ใครคือ Secret Buddy ของคุณ?
          </h3>

          {state.status === "COMPLETED" && state.completedResult ? (
            <div className="mt-3 space-y-2.5">
              <div
                className={`rounded-xl border p-3.5 text-sm ${
                  state.completedResult.isCorrect
                    ? "border-accent/40 bg-accent/15 text-text-primary"
                    : "border-border-default bg-surface-elevated/70 text-text-primary"
                }`}
              >
                <p className="font-bold">
                  {state.completedResult.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 text-accent-light">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>ทายถูกเป๊ะ! ตาดีมากครับ 🎉</span>
                    </span>
                  ) : currentGuessedName ? (
                    <span>เกือบถูกแล้ว! คุณทายว่า {currentGuessedName}</span>
                  ) : (
                    <span>คุณไม่ได้ส่งคำทายในรอบนี้</span>
                  )}
                </p>
                {state.completedResult.actualGiverName && (
                  <p className="mt-1 text-text-secondary">
                    Secret Buddy ตัวจริงของคุณคือ{" "}
                    <strong className="text-gold">{state.completedResult.actualGiverName}</strong>
                  </p>
                )}
                <p className="mt-2 text-xs text-text-muted">
                  สรุปทั้งกลุ่ม: ทายถูก {state.completedResult.correctCount} จาก{" "}
                  {state.completedResult.totalGuesses} คนที่ร่วมทาย
                </p>
              </div>
            </div>
          ) : state.isOpen ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs leading-relaxed text-text-secondary">
                เปิดโหวตแล้ว! ลองทายดูว่าใครแอบเป็น Secret Buddy ดูแลคุณอยู่
                ผลเฉลยจะเปิดพร้อมกันเมื่อจบกิจกรรม
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="flex-1"
                  aria-label="เลือกเพื่อนที่คิดว่าเป็นบัดดี้"
                >
                  <option value="">-- เลือกชื่อเพื่อน --</option>
                  {state.candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </Select>
                <ChristmasButton
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!selectedId || saving}
                  onClick={handleVote}
                >
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                  <span>{saving ? "กำลังบันทึก..." : currentGuessedName ? "เปลี่ยนคำทาย" : "ส่งคำทาย"}</span>
                </ChristmasButton>
              </div>
              {currentGuessedName && (
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>คำทายปัจจุบันของคุณ: {currentGuessedName}</span>
                </p>
              )}
              {message && <Alert tone="success">{message}</Alert>}
              {error && <Alert tone="error">{error}</Alert>}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {state.revealAt
                ? `รอบโหวตทายบัดดี้จะเปิดอัตโนมัติ 24 ชั่วโมงก่อนวันเฉลย (${formatThaiDateTime(state.revealAt)})`
                : "ผู้ดูแลกลุ่มยังไม่ได้เปิดรอบโหวตทายบัดดี้ (จะเปิดให้โหวตช่วงโค้งสุดท้ายก่อนเฉลย)"}
            </p>
          )}
        </div>
      </div>
    </ChristmasCard>
  );
}
