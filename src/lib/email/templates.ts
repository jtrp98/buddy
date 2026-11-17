import { getInterestLabel } from "../constants";

export interface BuddyEmailProfile {
  displayName: string;
  interests: string[];
  interestOther: string | null;
  favoriteColor: string | null;
  favoriteFoodDrink: string | null;
  hobbies: string | null;
  giftStyle: string | null;
  dislikes: string | null;
  allergies: string | null;
  wishList: string | null;
  noteToBuddy: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapEmailLayout(title: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fbf4e6;font-family:'Noto Sans Thai',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2a1f1b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#fffdf7;border-radius:20px;border:2px solid #2a1f1b;overflow:hidden;box-shadow:5px 5px 0 #2a1f1b;">
          <tr>
            <td style="height:8px;background:repeating-linear-gradient(-45deg,#c8322b 0 12px,#fffdf7 12px 22px,#1f5e46 22px 34px,#fffdf7 34px 44px);border-bottom:2px solid #2a1f1b;"></td>
          </tr>
          <tr>
            <td style="background-color:#1f5e46;padding:22px 28px;color:#fffdf7;border-bottom:2px solid #2a1f1b;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#f6e3a8;text-transform:uppercase;">★ NORTH POLE HOLIDAY POST ★</div>
              <div style="font-size:22px;font-weight:700;letter-spacing:-0.01em;margin-top:4px;">🎁 Secret Buddy</div>
              <div style="font-size:13px;color:#dff0e6;margin-top:3px;">กิจกรรมแลกของขวัญคริสต์มาสแบบลับสุดยอด</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;background-color:#fffdf7;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background-color:#f3e7d1;border-top:2px dashed #cbb7a6;font-size:12px;color:#5c493e;text-align:center;">
              อีเมลนี้ส่งโดยระบบอัตโนมัติของ Secret Buddy • กรุณาอย่าแชร์ลิงก์ส่วนตัวให้ผู้อื่น
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderBuddyProfileDetailsHtml(buddy: BuddyEmailProfile): string {
  const interestLabels = buddy.interests.map((k) => getInterestLabel(k));
  const interestsDisplay =
    interestLabels.length > 0 ? interestLabels.map(escapeHtml).join(", ") : "ไม่ได้ระบุ";

  const detailRows: Array<{ label: string; value: string | null }> = [
    { label: "🎁 Wish List ของที่อยากได้", value: buddy.wishList },
    { label: "🎨 สีที่ชอบ", value: buddy.favoriteColor },
    { label: "☕ อาหาร / เครื่องดื่มโปรด", value: buddy.favoriteFoodDrink },
    { label: "❤️ งานอดิเรก", value: buddy.hobbies },
    { label: "✨ สไตล์ของขวัญที่ชอบ", value: buddy.giftStyle },
  ];

  const filledRows = detailRows.filter((r) => r.value && r.value.trim().length > 0);
  const hasAnyOptional =
    filledRows.length > 0 ||
    Boolean(buddy.interestOther?.trim()) ||
    Boolean(buddy.dislikes?.trim()) ||
    Boolean(buddy.allergies?.trim()) ||
    Boolean(buddy.noteToBuddy?.trim());

  const rowsHtml = filledRows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 0;border-top:1px dashed #dccbb5;font-size:13px;font-weight:700;color:#5c493e;width:42%;vertical-align:top;">
          ${escapeHtml(r.label)}
        </td>
        <td style="padding:8px 0 8px 12px;border-top:1px dashed #dccbb5;font-size:14px;color:#2a1f1b;vertical-align:top;white-space:pre-line;">
          ${escapeHtml(r.value!.trim())}
        </td>
      </tr>`
    )
    .join("");

  const warningsHtml = [
    buddy.dislikes?.trim()
      ? `<div style="background-color:#fff4db;border:1.5px solid #c98a1b;border-radius:10px;padding:10px 14px;margin-top:10px;font-size:13px;color:#6e4706;">
          <strong>👎 สิ่งที่ไม่ชอบ:</strong> ${escapeHtml(buddy.dislikes.trim())}
        </div>`
      : "",
    buddy.allergies?.trim()
      ? `<div style="background-color:#fde2df;border:1.5px solid #c8322b;border-radius:10px;padding:10px 14px;margin-top:10px;font-size:13px;color:#9e221d;">
          <strong>⚠️ สิ่งที่แพ้ / ควรหลีกเลี่ยง:</strong> ${escapeHtml(buddy.allergies.trim())}
        </div>`
      : "",
    buddy.noteToBuddy?.trim()
      ? `<div style="background-color:#eef7f2;border:1.5px solid #1f5e46;border-radius:10px;padding:10px 14px;margin-top:10px;font-size:13px;color:#184735;">
          <strong>💌 ข้อความถึงซานต้า:</strong> “${escapeHtml(buddy.noteToBuddy.trim())}”
        </div>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <div style="background-color:#fff8ea;border:2px solid #2a1f1b;border-radius:16px;padding:18px 20px;margin:0 0 18px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;color:#1f5e46;text-transform:uppercase;">★ SECRET BUDDY ของคุณ ★</div>
      <div style="font-size:26px;font-weight:700;color:#c8322b;margin:4px 0 12px;">
        ${escapeHtml(buddy.displayName)}
      </div>

      <div style="font-size:13px;color:#5c493e;margin-bottom:4px;"><strong>หมวดหมู่ของขวัญที่สนใจ:</strong></div>
      <div style="font-size:14px;font-weight:600;color:#2a1f1b;margin-bottom:${buddy.interestOther?.trim() ? "6px" : "10px"};">
        ${interestsDisplay}
      </div>
      ${
        buddy.interestOther?.trim()
          ? `<div style="font-size:13px;color:#4d3d35;margin-bottom:10px;"><strong>ระบุเพิ่มเติม:</strong> ${escapeHtml(buddy.interestOther.trim())}</div>`
          : ""
      }

      ${
        filledRows.length > 0
          ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:6px;">${rowsHtml}</table>`
          : ""
      }

      ${warningsHtml}

      ${
        !hasAnyOptional
          ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #dccbb5;font-size:12px;color:#6d5a4e;">
              (ขณะนี้ ${escapeHtml(buddy.displayName)} ระบุไว้เฉพาะหมวดหมู่ความชอบเบื้องต้น)
            </div>`
          : ""
      }
    </div>
  `;
}

function renderBuddyProfileDetailsText(buddy: BuddyEmailProfile): string[] {
  const interestLabels = buddy.interests.map((k) => getInterestLabel(k));
  const lines: string[] = [
    `🎯 Buddy ที่คุณต้องดูแลคือ: ${buddy.displayName}`,
    `• หมวดหมู่ของขวัญที่สนใจ: ${interestLabels.length > 0 ? interestLabels.join(", ") : "ไม่ได้ระบุ"}`,
  ];
  if (buddy.interestOther?.trim()) {
    lines.push(`• ความชอบอื่น ๆ เพิ่มเติม: ${buddy.interestOther.trim()}`);
  }
  if (buddy.wishList?.trim()) {
    lines.push(`• Wish List ของที่อยากได้: ${buddy.wishList.trim()}`);
  }
  if (buddy.favoriteColor?.trim()) {
    lines.push(`• สีที่ชอบ: ${buddy.favoriteColor.trim()}`);
  }
  if (buddy.favoriteFoodDrink?.trim()) {
    lines.push(`• อาหาร/เครื่องดื่มโปรด: ${buddy.favoriteFoodDrink.trim()}`);
  }
  if (buddy.hobbies?.trim()) {
    lines.push(`• งานอดิเรก: ${buddy.hobbies.trim()}`);
  }
  if (buddy.giftStyle?.trim()) {
    lines.push(`• สไตล์ของขวัญที่ชอบ: ${buddy.giftStyle.trim()}`);
  }
  if (buddy.dislikes?.trim()) {
    lines.push(`• สิ่งที่ไม่ชอบ: ${buddy.dislikes.trim()}`);
  }
  if (buddy.allergies?.trim()) {
    lines.push(`• สิ่งที่แพ้/ควรหลีกเลี่ยง: ${buddy.allergies.trim()}`);
  }
  if (buddy.noteToBuddy?.trim()) {
    lines.push(`• ข้อความถึงซานต้า: "${buddy.noteToBuddy.trim()}"`);
  }
  return lines;
}

export function buildVerifyEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  verifyUrl: string;
}) {
  const { memberName, groupTitle, budgetText, verifyUrl } = params;
  const subject = `✉️ ยืนยันอีเมลเข้าร่วม Secret Buddy — ${groupTitle}`;

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 16px;color:#4d3d35;">
      คุณได้ลงทะเบียนเข้าร่วมกิจกรรม <strong>${escapeHtml(groupTitle)}</strong> เรียบร้อยแล้ว
    </p>
    <div style="background-color:#fde2df;border:2px solid #2a1f1b;border-radius:12px;padding:12px 16px;margin:0 0 20px;font-size:14px;color:#9e221d;">
      🎁 งบประมาณของขวัญ: <strong>${escapeHtml(budgetText)}</strong>
    </div>
    <p style="font-size:14px;line-height:1.65;margin:0 0 22px;color:#4d3d35;">
      กรุณากดปุ่มด้านล่างเพื่อประทับตรายืนยันอีเมลของคุณ เพื่อให้ระบบนับรวมคุณเข้าสู่การสุ่มจับคู่ Buddy (ลิงก์หมดอายุภายใน 24 ชั่วโมง)
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background-color:#c8322b;color:#fffdf7;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        ยืนยันอีเมลของฉัน
      </a>
    </div>
    <div style="background-color:#eef7f2;border:1.5px solid #1f5e46;border-radius:12px;padding:12px 16px;margin:18px 0 0;font-size:13px;line-height:1.6;color:#184735;">
      💡 <strong>เพิ่มข้อมูลเกี่ยวกับตัวเองได้ทุกเมื่อที่เว็บนี้:</strong> หลังกดยืนยันอีเมลแล้ว ระบบจะส่งลิงก์ส่วนตัวให้คุณสามารถกลับมาเพิ่มหรือแก้ไขความชอบและ Wish List ได้ตลอดเวลา
    </div>
    `
  );

  const text = [
    `สวัสดีคุณ${memberName}`,
    ``,
    `คุณได้ลงทะเบียนเข้าร่วมกิจกรรม ${groupTitle}`,
    `งบประมาณของขวัญ: ${budgetText}`,
    ``,
    `กรุณากดลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ (หมดอายุภายใน 24 ชั่วโมง):`,
    verifyUrl,
    ``,
    `💡 หลังกดยืนยันอีเมลแล้ว คุณสามารถกลับมาเพิ่มหรือแก้ไขข้อมูลความชอบและ Wish List ได้ทุกเมื่อที่เว็บนี้`,
  ].join("\n");

  return { subject, html, text };
}

export function buildManageProfileEmail(params: {
  memberName: string;
  groupTitle: string;
  manageUrl: string;
}) {
  const { memberName, groupTitle, manageUrl } = params;
  const subject = `📝 ลิงก์แก้ไขข้อมูล Buddy Profile — ${groupTitle}`;

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 18px;color:#4d3d35;">
      อีเมลของคุณได้รับการยืนยันสำหรับกิจกรรม <strong>${escapeHtml(groupTitle)}</strong> แล้ว!
      คุณสามารถเก็บลิงก์ส่วนตัวด้านล่างไว้สำหรับกลับมาเพิ่มหรือแก้ไขความชอบและ Wish List ได้ทุกเมื่อที่เว็บนี้ (หากอัปเดตข้อมูลหลังสุ่มจับคู่แล้ว ระบบจะส่งอีเมลแจ้งข้อมูลใหม่ให้ซานต้าของคุณโดยอัตโนมัติ)
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${manageUrl}" style="display:inline-block;background-color:#1f5e46;color:#fffdf7;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        เพิ่ม / แก้ไข Buddy Profile ของฉัน
      </a>
    </div>
    `
  );

  const text = [
    `สวัสดีคุณ${memberName}`,
    ``,
    `ยืนยันอีเมลสำหรับกิจกรรม ${groupTitle} สำเร็จแล้ว!`,
    `คุณสามารถใช้ลิงก์ส่วนตัวนี้เพื่อกลับมาเพิ่มหรือแก้ไขข้อมูลความชอบและ Wish List ได้ทุกเมื่อที่เว็บนี้ (หากอัปเดตหลังจับคู่แล้ว ระบบจะส่งอีเมลแจ้งซานต้าให้อัตโนมัติ):`,
    manageUrl,
  ].join("\n");

  return { subject, html, text };
}

export function buildResultNotificationEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  resultUrl: string;
  buddy?: BuddyEmailProfile;
  manageUrl?: string;
}) {
  const { memberName, groupTitle, budgetText, resultUrl, buddy, manageUrl } = params;
  const subject = buddy
    ? `🎁 Secret Buddy — คุณได้ดูแลคุณ ${buddy.displayName} (${groupTitle})`
    : "🎁 Secret Buddy — ผลการจับคู่ของคุณมาแล้ว!";

  const buddySectionHtml = buddy
    ? `
      ${renderBuddyProfileDetailsHtml(buddy)}
      <div style="background-color:#eef7f2;border:1.5px solid #1f5e46;border-radius:12px;padding:12px 16px;margin:0 0 20px;font-size:13px;line-height:1.6;color:#184735;">
        📬 <strong>แจ้งเพื่อทราบ:</strong> หากคุณ <strong>${escapeHtml(buddy.displayName)}</strong> มีการเข้ามาอัปเดตข้อมูลเกี่ยวกับตัวเองหรือ Wish List เพิ่มเติมในภายหลัง ระบบจะส่งอีเมลมาแจ้งข้อมูลล่าสุดให้คุณทราบเพิ่มโดยอัตโนมัติ
      </div>
    `
    : `
      <p style="font-size:15px;line-height:1.65;margin:0 0 18px;color:#4d3d35;">
        ซองพัสดุลับของคุณถูกผนึกขี้ผึ้งเรียบร้อย กดเปิดดูได้แล้วว่าใครคือคนที่คุณต้องดูแล
      </p>
    `;

  const manageSectionHtml = manageUrl
    ? `
      <div style="margin-top:20px;padding-top:16px;border-top:1px dashed #cbb7a6;text-align:center;">
        <p style="font-size:13px;color:#5c493e;margin:0 0 10px;">
          อยากเพิ่มหรืออัปเดตข้อมูลความชอบของตัวเองให้ซานต้าของคุณรู้เพิ่มไหม?
        </p>
        <a href="${manageUrl}" style="display:inline-block;background-color:#1f5e46;color:#fffdf7;text-decoration:none;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;border:2px solid #2a1f1b;">
          📝 เพิ่ม / แก้ไขข้อมูลของฉัน
        </a>
      </div>
    `
    : "";

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 14px;color:#4d3d35;">
      กิจกรรม <strong>${escapeHtml(groupTitle)}</strong> ได้สุ่มจับคู่เรียบร้อยแล้ว!
    </p>
    <div style="background-color:#fdf3d7;border:2px solid #2a1f1b;border-radius:12px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:#2a1f1b;">
      🎁 งบประมาณของขวัญ: <strong>${escapeHtml(budgetText)}</strong>
    </div>
    ${buddySectionHtml}
    <p style="font-size:14px;margin:0 0 14px;color:#5c493e;text-align:center;">
      สามารถกดเปิดกล่องของขวัญและดูการ์ดจดหมายชื่อ Buddy บนหน้าเว็บได้ที่ปุ่มด้านล่าง
    </p>
    <div style="text-align:center;margin:20px 0;">
      <a href="${resultUrl}" style="display:inline-block;background-color:#c8322b;color:#fffdf7;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        🎁 แกะซองดู Buddy ของฉัน
      </a>
    </div>
    <p style="font-size:14px;margin:18px 0 6px;color:#4d3d35;text-align:center;">อย่าบอกใครว่าคุณได้ใครนะ 🤫</p>
    <p style="font-size:14px;margin:0;color:#4d3d35;text-align:center;">ขอให้สนุกกับกิจกรรม Secret Buddy!</p>
    ${manageSectionHtml}
    `
  );

  const textLines = [
    `สวัสดีคุณ${memberName} 👋`,
    ``,
    `กิจกรรม ${groupTitle} ได้สุ่มจับคู่เรียบร้อยแล้ว!`,
    `🎁 งบประมาณของขวัญ: ${budgetText}`,
    ``,
  ];

  if (buddy) {
    textLines.push(...renderBuddyProfileDetailsText(buddy));
    textLines.push(
      ``,
      `📬 หมายเหตุ: หากคุณ ${buddy.displayName} มีการอัปเดตข้อมูลเกี่ยวกับตัวเองหรือ Wish List เพิ่มเติม ระบบจะส่งอีเมลมาแจ้งข้อมูลล่าสุดให้คุณทราบเพิ่มโดยอัตโนมัติ`,
      ``
    );
  } else {
    textLines.push(`ตอนนี้คุณสามารถดูได้แล้วว่าใครคือคนที่คุณต้องดูแล`, ``);
  }

  textLines.push(
    `กดลิงก์ด้านล่างเพื่อเปิดกล่องดูการ์ด Buddy ของคุณบนเว็บ:`,
    resultUrl,
    ``,
    `อย่าบอกใครว่าคุณได้ใครนะ 🤫`,
    `ขอให้สนุกกับกิจกรรม Secret Buddy!`
  );

  if (manageUrl) {
    textLines.push(``, `เพิ่มหรือแก้ไขข้อมูลความชอบของตัวเองได้ที่:`, manageUrl);
  }

  return { subject, html, text: textLines.join("\n") };
}

export function buildBuddyProfileUpdatedEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  buddy: BuddyEmailProfile;
  resultUrl?: string;
}) {
  const { memberName, groupTitle, budgetText, buddy, resultUrl } = params;
  const subject = `🔔 Buddy ของคุณ (${buddy.displayName}) อัปเดตข้อมูลเพิ่มเติมแล้ว! — ${groupTitle}`;

  const ctaHtml = resultUrl
    ? `
    <div style="text-align:center;margin:22px 0 8px;">
      <a href="${resultUrl}" style="display:inline-block;background-color:#c8322b;color:#fffdf7;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        🎁 เปิดดูการ์ด Buddy บนเว็บ
      </a>
    </div>
    `
    : "";

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 14px;color:#4d3d35;">
      Buddy ของคุณในกิจกรรม <strong>${escapeHtml(groupTitle)}</strong> ได้เข้ามาอัปเดตข้อมูลความชอบ / Wish List เพิ่มเติมแล้ว นี่คือข้อมูลล่าสุดของ <strong>${escapeHtml(buddy.displayName)}</strong> ครับ:
    </p>
    <div style="background-color:#fdf3d7;border:2px solid #2a1f1b;border-radius:12px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:#2a1f1b;">
      🎁 งบประมาณของขวัญ: <strong>${escapeHtml(budgetText)}</strong>
    </div>
    ${renderBuddyProfileDetailsHtml(buddy)}
    ${ctaHtml}
    `
  );

  const textLines = [
    `สวัสดีคุณ${memberName} 🎄`,
    ``,
    `Buddy ของคุณในกิจกรรม ${groupTitle} ได้เข้ามาอัปเดตข้อมูลความชอบ / Wish List เพิ่มเติมแล้ว!`,
    `🎁 งบประมาณของขวัญ: ${budgetText}`,
    ``,
    ...renderBuddyProfileDetailsText(buddy),
  ];

  if (resultUrl) {
    textLines.push(``, `ดูการ์ด Buddy บนเว็บ:`, resultUrl);
  }

  return { subject, html, text: textLines.join("\n") };
}

export function buildRecoveryLinkEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  targetUrl: string;
  isResultLink: boolean;
  secondaryManageUrl?: string;
}) {
  const { memberName, groupTitle, budgetText, targetUrl, isResultLink, secondaryManageUrl } = params;
  const subject = isResultLink
    ? `🔑 ลิงก์ใหม่สำหรับดู Buddy & แก้ไขข้อมูลของคุณ — ${groupTitle}`
    : `🔑 ลิงก์ใหม่สำหรับแก้ไขข้อมูลของคุณ — ${groupTitle}`;

  const ctaLabel = isResultLink ? "ดู Buddy ของฉัน (ลิงก์ใหม่)" : "แก้ไข Buddy Profile ของฉัน";
  const detailText = isResultLink
    ? "เราได้ออกลิงก์ใหม่สำหรับดูผลการจับคู่และลิงก์แก้ไขข้อมูลส่วนตัวของคุณแล้ว ลิงก์เดิมก่อนหน้านี้จะไม่สามารถใช้งานได้อีกเพื่อความปลอดภัย"
    : "เราได้ออกลิงก์ใหม่สำหรับเพิ่มหรือแก้ไขข้อมูลความชอบของคุณในกิจกรรมนี้แล้ว ลิงก์เดิมจะถูกยกเลิกโดยอัตโนมัติ";

  const secondaryHtml = secondaryManageUrl
    ? `
    <div style="margin-top:18px;padding-top:16px;border-top:1px dashed #cbb7a6;text-align:center;">
      <p style="font-size:13px;color:#5c493e;margin:0 0 10px;">
        หากต้องการเพิ่มหรืออัปเดตข้อมูลความชอบ / Wish List ของตัวเอง (ระบบจะส่งเมลแจ้งซานต้าให้อัตโนมัติ):
      </p>
      <a href="${secondaryManageUrl}" style="display:inline-block;background-color:#1f5e46;color:#fffdf7;text-decoration:none;font-weight:700;font-size:14px;padding:11px 22px;border-radius:10px;border:2px solid #2a1f1b;">
        📝 แก้ไข Buddy Profile ของฉัน (ลิงก์ใหม่)
      </a>
    </div>
    `
    : "";

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 16px;color:#4d3d35;">
      ${detailText}
    </p>
    <div style="background-color:#fde2df;border:2px solid #2a1f1b;border-radius:12px;padding:12px 16px;margin:0 0 20px;font-size:14px;color:#9e221d;">
      🎁 งบประมาณของขวัญ: <strong>${escapeHtml(budgetText)}</strong>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${targetUrl}" style="display:inline-block;background-color:#c8322b;color:#fffdf7;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        ${ctaLabel}
      </a>
    </div>
    ${secondaryHtml}
    `
  );

  const textLines = [
    `สวัสดีคุณ${memberName}`,
    ``,
    detailText,
    `🎁 งบประมาณของขวัญ: ${budgetText}`,
    ``,
    `${ctaLabel}:`,
    targetUrl,
  ];

  if (secondaryManageUrl) {
    textLines.push(``, `แก้ไข Buddy Profile ของฉัน (ลิงก์ใหม่):`, secondaryManageUrl);
  }

  return { subject, html, text: textLines.join("\n") };
}
