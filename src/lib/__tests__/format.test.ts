import { describe, expect, it } from "vitest";
import { formatBudget, formatBudgetWithPrefix } from "../budget";
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
});
