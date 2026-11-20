"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { Copy, Check, Download, QrCode, X } from "lucide-react";
import { ChristmasButton, ChristmasCard } from "@/components/ui/ChristmasUI";
import { formatBudgetWithPrefix, type BudgetTypeValue } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";

interface InvitePosterModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string | null;
  inviteCode: string;
  inviteUrl: string;
  budgetType: BudgetTypeValue;
  budgetMin: number | null;
  budgetMax: number | null;
  registrationClosesAt: string;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split("");
  let line = "";
  let currentY = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        const remaining = words.slice(i).join("");
        const clipped =
          ctx.measureText(remaining).width > maxWidth
            ? remaining.slice(0, 28) + "..."
            : remaining;
        ctx.fillText(clipped, x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export function InvitePosterModal({
  open,
  onClose,
  title,
  description,
  inviteCode,
  inviteUrl,
  budgetType,
  budgetMin,
  budgetMax,
  registrationClosesAt,
}: InvitePosterModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !inviteUrl) return;
    let cancelled = false;
    QRCode.toDataURL(inviteUrl, {
      width: 360,
      margin: 2,
      color: { dark: "#1d140f", light: "#fffaf0" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, inviteUrl]);

  if (!open || typeof document === "undefined") return null;

  const budgetText = formatBudgetWithPrefix(budgetType, budgetMin, budgetMax);
  const closesText = formatThaiDateTime(registrationClosesAt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadPng = async () => {
    if (!qrDataUrl) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Parchment background
      ctx.fillStyle = "#fbf3e4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Festive outer border
      ctx.strokeStyle = "#b82924";
      ctx.lineWidth = 14;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      ctx.strokeStyle = "#1f5e46";
      ctx.lineWidth = 4;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

      // Header kicker
      ctx.fillStyle = "#b82924";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NORTH POLE POST • SECRET BUDDY INVITATION", canvas.width / 2, 108);

      // Title
      ctx.fillStyle = "#241914";
      ctx.font = "bold 44px sans-serif";
      let nextY = wrapCanvasText(ctx, title, canvas.width / 2, 178, 640, 56, 2);

      // Description
      if (description) {
        ctx.fillStyle = "#5c493e";
        ctx.font = "24px sans-serif";
        nextY = wrapCanvasText(ctx, description, canvas.width / 2, nextY + 12, 620, 34, 2);
      }

      // Divider
      ctx.strokeStyle = "#d9c4ad";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, nextY + 18);
      ctx.lineTo(canvas.width - 120, nextY + 18);
      ctx.stroke();

      // QR frame
      const qrSize = 360;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = Math.max(nextY + 46, 320);

      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36);
      ctx.strokeStyle = "#241914";
      ctx.lineWidth = 4;
      ctx.strokeRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("QR image load failed"));
        img.src = qrDataUrl;
      });
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Info footer
      const infoY = qrY + qrSize + 64;
      ctx.fillStyle = "#1f5e46";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("สแกน QR Code เพื่อเข้าร่วมจับฉลาก Secret Buddy", canvas.width / 2, infoY);

      ctx.fillStyle = "#241914";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(budgetText, canvas.width / 2, infoY + 52);

      ctx.fillStyle = "#5c493e";
      ctx.font = "22px sans-serif";
      ctx.fillText(`ปิดรับสมัคร: ${closesText}`, canvas.width / 2, infoY + 94);

      ctx.fillStyle = "#8f6f5b";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`INVITE CODE: ${inviteCode}`, canvas.width / 2, canvas.height - 74);

      const link = document.createElement("a");
      link.download = `secret-buddy-${inviteCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="การ์ดเชิญเข้ากลุ่มและ QR Code"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto">
        <ChristmasCard elevated withStripe className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold text-text-primary">การ์ดเชิญ &amp; QR Code</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
              className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Vintage Preview Card */}
          <div className="mt-4 rounded-2xl border-2 border-[#2a1f1b] bg-[#fbf3e4] p-5 text-center text-[#241914] shadow-inner">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b82924] uppercase">
              North Pole Post • Official Invite
            </p>
            <h3 className="mt-1.5 text-xl font-bold leading-snug text-[#241914]">{title}</h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-[#5c493e]">{description}</p>
            )}

            <div className="mx-auto mt-4 inline-flex rounded-xl border-2 border-[#241914] bg-[#fffaf0] p-2.5 shadow-sm">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Code สำหรับเข้าร่วม ${title}`}
                  className="h-44 w-44"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center text-xs text-[#5c493e]">
                  กำลังสร้าง QR...
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <p className="font-bold text-[#1f5e46]">{budgetText}</p>
              <p className="text-[#5c493e]">ปิดรับสมัคร: {closesText}</p>
              <p className="font-mono text-[11px] font-bold text-[#8f6f5b]">
                CODE: {inviteCode}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <ChristmasButton
              type="button"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={!qrDataUrl || downloading}
              onClick={handleDownloadPng}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{downloading ? "กำลังสร้างไฟล์..." : "ดาวน์โหลดโปสเตอร์ PNG"}</span>
            </ChristmasButton>
            <ChristmasButton
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-accent-light" aria-hidden="true" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </ChristmasButton>
          </div>
        </ChristmasCard>
      </div>
    </div>,
    document.body
  );
}
