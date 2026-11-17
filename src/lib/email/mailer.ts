import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface DevOutboxItem {
  id: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  createdAt: string;
}

const DEV_OUTBOX_PATH = path.join(process.cwd(), ".dev-outbox.json");

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function sendViaSmtp(input: SendMailInput): Promise<void> {
  const port = Number(process.env.SMTP_PORT || "465");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });

  const from =
    process.env.EMAIL_FROM?.trim() || `Secret Buddy <${process.env.SMTP_USER!.trim()}>`;

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

async function sendViaResend(input: SendMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Secret Buddy <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Resend API error");
    throw new Error(`Resend failed (${res.status}): ${errText.slice(0, 150)}`);
  }
}

async function appendDevOutbox(input: SendMailInput): Promise<void> {
  let existing: DevOutboxItem[] = [];
  try {
    const raw = await fs.readFile(DEV_OUTBOX_PATH, "utf8");
    existing = JSON.parse(raw) as DevOutboxItem[];
  } catch {
    existing = [];
  }

  const nextItem: DevOutboxItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    createdAt: new Date().toISOString(),
  };

  const updated = [nextItem, ...existing].slice(0, 50);
  await fs.writeFile(DEV_OUTBOX_PATH, JSON.stringify(updated, null, 2), "utf8");
}

export async function readDevOutbox(): Promise<DevOutboxItem[]> {
  if (process.env.NODE_ENV === "production") return [];
  try {
    const raw = await fs.readFile(DEV_OUTBOX_PATH, "utf8");
    return JSON.parse(raw) as DevOutboxItem[];
  } catch {
    return [];
  }
}

export async function clearDevOutbox(): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  try {
    await fs.unlink(DEV_OUTBOX_PATH);
  } catch {
    // ignore if missing
  }
}

export async function sendMail(input: SendMailInput): Promise<void> {
  if (isSmtpConfigured()) {
    await sendViaSmtp(input);
    return;
  }

  if (isResendConfigured()) {
    await sendViaResend(input);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    await appendDevOutbox(input);
    // Intentionally log only metadata without tokens or URLs
    console.info(`[DEV_MAIL] Recorded email "${input.subject}" in .dev-outbox.json`);
    return;
  }

  throw new Error(
    "ยังไม่ได้ตั้งค่าระบบส่งอีเมล (กรุณาตั้งค่า SMTP_HOST/SMTP_USER/SMTP_PASS หรือ RESEND_API_KEY)"
  );
}
