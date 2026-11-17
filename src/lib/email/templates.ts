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
      คุณสามารถเก็บลิงก์ส่วนตัวด้านล่างไว้สำหรับกลับมาแก้ไขความชอบหรือ Wish List ก่อนปิดรับสมัครได้ตลอดเวลา
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${manageUrl}" style="display:inline-block;background-color:#1f5e46;color:#fffdf7;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        แก้ไข Buddy Profile ของฉัน
      </a>
    </div>
    `
  );

  const text = [
    `สวัสดีคุณ${memberName}`,
    ``,
    `ยืนยันอีเมลสำหรับกิจกรรม ${groupTitle} สำเร็จแล้ว!`,
    `คุณสามารถใช้ลิงก์ส่วนตัวนี้เพื่อแก้ไขข้อมูลความชอบก่อนปิดรับสมัคร:`,
    manageUrl,
  ].join("\n");

  return { subject, html, text };
}

export function buildResultNotificationEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  resultUrl: string;
}) {
  const { memberName, groupTitle, budgetText, resultUrl } = params;
  const subject = "🎁 Secret Buddy — ผลการจับคู่ของคุณมาแล้ว!";

  const html = wrapEmailLayout(
    subject,
    `
    <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2a1f1b;">สวัสดีคุณ${escapeHtml(memberName)} 🎄</p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 12px;color:#4d3d35;">
      กิจกรรม <strong>${escapeHtml(groupTitle)}</strong> ได้สุ่มจับคู่เรียบร้อยแล้ว!
    </p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 18px;color:#4d3d35;">
      ซองพัสดุลับของคุณถูกผนึกขี้ผึ้งเรียบร้อย กดเปิดดูได้แล้วว่าใครคือคนที่คุณต้องดูแล
    </p>
    <div style="background-color:#fdf3d7;border:2px solid #2a1f1b;border-radius:12px;padding:14px 18px;margin:0 0 22px;font-size:15px;color:#2a1f1b;">
      🎁 งบประมาณของขวัญ: <strong>${escapeHtml(budgetText)}</strong>
    </div>
    <p style="font-size:14px;margin:0 0 16px;color:#5c493e;">
      กดปุ่มด้านล่างเพื่อแกะซองดู Buddy ของคุณ
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resultUrl}" style="display:inline-block;background-color:#c8322b;color:#fffdf7;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;border:2px solid #2a1f1b;box-shadow:0 3px 0 #2a1f1b;">
        🎁 แกะซองดู Buddy ของฉัน
      </a>
    </div>
    <p style="font-size:14px;margin:18px 0 6px;color:#4d3d35;">อย่าบอกใครว่าคุณได้ใครนะ 🤫</p>
    <p style="font-size:14px;margin:0;color:#4d3d35;">ขอให้สนุกกับกิจกรรม Secret Buddy!</p>
    `
  );

  const text = [
    `สวัสดีคุณ${memberName} 👋`,
    ``,
    `กิจกรรม ${groupTitle} ได้สุ่มจับคู่เรียบร้อยแล้ว!`,
    `ตอนนี้คุณสามารถดูได้แล้วว่าใครคือคนที่คุณต้องดูแล`,
    ``,
    `🎁 งบประมาณของขวัญ: ${budgetText}`,
    ``,
    `กดลิงก์ด้านล่างเพื่อดู Buddy ของคุณ:`,
    resultUrl,
    ``,
    `อย่าบอกใครว่าคุณได้ใครนะ 🤫`,
    `ขอให้สนุกกับกิจกรรม Secret Buddy!`,
  ].join("\n");

  return { subject, html, text };
}

export function buildRecoveryLinkEmail(params: {
  memberName: string;
  groupTitle: string;
  budgetText: string;
  targetUrl: string;
  isResultLink: boolean;
}) {
  const { memberName, groupTitle, budgetText, targetUrl, isResultLink } = params;
  const subject = isResultLink
    ? `🔑 ลิงก์ใหม่สำหรับดู Buddy ของคุณ — ${groupTitle}`
    : `🔑 ลิงก์ใหม่สำหรับแก้ไขข้อมูลของคุณ — ${groupTitle}`;

  const ctaLabel = isResultLink ? "ดู Buddy ของฉัน (ลิงก์ใหม่)" : "แก้ไข Buddy Profile ของฉัน";
  const detailText = isResultLink
    ? "เราได้ออกลิงก์ใหม่สำหรับดูผลการจับคู่ของคุณแล้ว ลิงก์เดิมก่อนหน้านี้จะไม่สามารถใช้งานได้อีกเพื่อความปลอดภัย"
    : "เราได้ออกลิงก์ใหม่สำหรับแก้ไขข้อมูลความชอบของคุณในกิจกรรมนี้แล้ว ลิงก์เดิมจะถูกยกเลิกโดยอัตโนมัติ";

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
    `
  );

  const text = [
    `สวัสดีคุณ${memberName}`,
    ``,
    detailText,
    `🎁 งบประมาณของขวัญ: ${budgetText}`,
    ``,
    targetUrl,
  ].join("\n");

  return { subject, html, text };
}
