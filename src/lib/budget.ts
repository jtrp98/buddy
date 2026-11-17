export type BudgetTypeValue = "FIXED" | "RANGE" | "MIN" | "UNLIMITED";

export function formatBudget(
  budgetType: BudgetTypeValue | string,
  budgetMin?: number | null,
  budgetMax?: number | null
): string {
  const fmt = (val: number) => val.toLocaleString("th-TH");

  switch (budgetType) {
    case "FIXED":
      return budgetMin != null ? `${fmt(budgetMin)} บาท` : "ตามที่กำหนด";
    case "RANGE":
      if (budgetMin != null && budgetMax != null) {
        return `${fmt(budgetMin)}–${fmt(budgetMax)} บาท`;
      }
      if (budgetMin != null) return `${fmt(budgetMin)} บาทขึ้นไป`;
      return "ไม่จำกัดงบ";
    case "MIN":
      return budgetMin != null ? `${fmt(budgetMin)} บาทขึ้นไป` : "ไม่จำกัดงบ";
    case "UNLIMITED":
    default:
      return "ไม่จำกัดงบ";
  }
}

export function formatBudgetWithPrefix(
  budgetType: BudgetTypeValue | string,
  budgetMin?: number | null,
  budgetMax?: number | null
): string {
  const base = formatBudget(budgetType, budgetMin, budgetMax);
  if (budgetType === "FIXED") return `งบตายตัว: ${base}`;
  if (budgetType === "RANGE") return `งบแบบช่วง: ${base}`;
  if (budgetType === "MIN") return `งบขั้นต่ำ: ${base}`;
  return base;
}
