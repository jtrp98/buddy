import { describe, expect, it } from "vitest";
import { formatBudget, formatBudgetWithPrefix } from "../budget";
import {
  buildBuddyProfileUpdatedEmail,
  buildRecoveryLinkEmail,
  buildResultNotificationEmail,
  buildVerifyEmail,
} from "../email/templates";
import { bangkokLocalInputToUtc, utcToBangkokLocalInput } from "../timezone";

describe("Budget & Bangkok Timezone Formatting", () => {
  it("formats all 4 gift budget types in Thai", () => {
    expect(formatBudget("FIXED", 300, null)).toBe("300 บาท");
    expect(formatBudget("RANGE", 200, 500)).toBe("200–500 บาท");
    expect(formatBudget("MIN", 200, null)).toBe("200 บาทขึ้นไป");
    expect(formatBudget("UNLIMITED", null, null)).toBe("ไม่จำกัดงบ");
    expect(formatBudgetWithPrefix("FIXED", 300, null)).toBe("งบตายตัว: 300 บาท");
  });

  it("converts Bangkok local wall-clock time (UTC+7) to UTC and back", () => {
    const utcDate = bangkokLocalInputToUtc("2026-12-25T18:00");
    expect(utcDate.toISOString()).toBe("2026-12-25T11:00:00.000Z");
    expect(utcToBangkokLocalInput(utcDate)).toBe("2026-12-25T18:00");
  });

  it("renders Buddy name, profile details, and update notice in result notification email", () => {
    const mail = buildResultNotificationEmail({
      memberName: "นนท์",
      groupTitle: "ปาร์ตี้คริสต์มาสออฟฟิศ",
      budgetText: "300 บาทขึ้นไป",
      resultUrl: "https://example.com/buddy?token=abc",
      manageUrl: "https://example.com/me/profile?token=xyz",
      buddy: {
        displayName: "แพรว",
        interests: ["coffee_tea", "books"],
        interestOther: null,
        favoriteColor: "เขียวมัทฉะ",
        favoriteFoodDrink: "ลาเต้ไม่หวาน",
        hobbies: "อ่านนิยาย",
        giftStyle: "มินิมอล",
        dislikes: "น้ำหอมกลิ่นฉุน",
        allergies: "แพ้ถั่ว",
        wishList: "แก้วเก็บความเย็น",
        noteToBuddy: "ขอบคุณล่วงหน้านะคะ!",
      },
    });

    expect(mail.subject).toContain("แพรว");
    expect(mail.html).toContain("แพรว");
    expect(mail.html).toContain("กาแฟ / ชา / เครื่องดื่ม, หนังสือ");
    expect(mail.html).toContain("เขียวมัทฉะ");
    expect(mail.html).toContain("แก้วเก็บความเย็น");
    expect(mail.html).toContain("แพ้ถั่ว");
    expect(mail.html).toContain("อัปเดตข้อมูลเกี่ยวกับตัวเองหรือ Wish List เพิ่มเติมในภายหลัง");
    expect(mail.html).toContain("https://example.com/buddy?token=abc");
    expect(mail.html).toContain("https://example.com/me/profile?token=xyz");
    expect(mail.text).toContain("แพรว");
  });

  it("renders updated Buddy profile notification email and recovery email with secondary manage link", () => {
    const updateMail = buildBuddyProfileUpdatedEmail({
      memberName: "นนท์",
      groupTitle: "ปาร์ตี้คริสต์มาสออฟฟิศ",
      budgetText: "300 บาทขึ้นไป",
      resultUrl: "https://example.com/buddy?token=newtoken",
      buddy: {
        displayName: "แพรว",
        interests: ["snacks"],
        interestOther: null,
        favoriteColor: null,
        favoriteFoodDrink: null,
        hobbies: null,
        giftStyle: null,
        dislikes: null,
        allergies: null,
        wishList: "ช็อกโกแลตพรีเมียม",
        noteToBuddy: null,
      },
    });
    expect(updateMail.subject).toContain("แพรว");
    expect(updateMail.html).toContain("ช็อกโกแลตพรีเมียม");

    const verifyMail = buildVerifyEmail({
      memberName: "แพรว",
      groupTitle: "ปาร์ตี้คริสต์มาสออฟฟิศ",
      budgetText: "300 บาทขึ้นไป",
      verifyUrl: "https://example.com/verify?token=v1",
    });
    expect(verifyMail.html).toContain("เพิ่มข้อมูลเกี่ยวกับตัวเองได้ทุกเมื่อที่เว็บนี้");

    const recoveryMail = buildRecoveryLinkEmail({
      memberName: "แพรว",
      groupTitle: "ปาร์ตี้คริสต์มาสออฟฟิศ",
      budgetText: "300 บาทขึ้นไป",
      targetUrl: "https://example.com/buddy?token=r1",
      isResultLink: true,
      secondaryManageUrl: "https://example.com/me/profile?token=m1",
    });
    expect(recoveryMail.html).toContain("https://example.com/buddy?token=r1");
    expect(recoveryMail.html).toContain("https://example.com/me/profile?token=m1");
  });
});
