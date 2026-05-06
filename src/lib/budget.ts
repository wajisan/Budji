import type { Bill, BudgetTable } from "../types";

export const STORAGE_KEY = "tables";

export function defaultTables(): BudgetTable[] {
  return [
    {
      name: "Fixe",
      bills: [
        { label: "Salaire Net", value: 2085 },
        { label: "Abonnement Spotify", value: -9.99 },
      ],
      countMe: true,
    },
    {
      name: "Variable",
      bills: [{ label: "Salaire futur", value: 2755 }],
      countMe: false,
    },
  ];
}

function normalizeBill(raw: unknown): Bill {
  if (!raw || typeof raw !== "object") {
    return { label: "", value: 0 };
  }
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === "string" ? o.label : "";
  const n = Number(o.value);
  return { label, value: Number.isFinite(n) ? n : 0 };
}

function normalizeTable(raw: unknown): BudgetTable | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name : "Budget";
  const billsRaw = Array.isArray(o.bills) ? o.bills : [];
  const bills = billsRaw.map(normalizeBill);
  const countMe = typeof o.countMe === "boolean" ? o.countMe : false;
  return { name, bills, countMe };
}

export function loadTables(): BudgetTable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTables();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultTables();
    const tables = parsed.map(normalizeTable).filter((t): t is BudgetTable => t !== null);
    return tables.length > 0 ? tables : defaultTables();
  } catch {
    return defaultTables();
  }
}

export function saveTables(tables: BudgetTable[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
}

export function importTablesJsonString(json: string): BudgetTable[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Le JSON doit être un tableau de carnets.");
  const tables = parsed.map(normalizeTable).filter((t): t is BudgetTable => t !== null);
  if (tables.length === 0) throw new Error("Aucun carnet valide dans le JSON.");
  return tables;
}

export function totalBills(bills: Bill[]): number {
  const sum = bills.reduce((acc, b) => acc + b.value, 0);
  return Math.round(sum * 100) / 100;
}

export function grandTotal(tables: BudgetTable[]): number {
  const sum = tables.filter((t) => t.countMe).reduce((acc, t) => acc + totalBills(t.bills), 0);
  return Math.round(sum * 100) / 100;
}

export function amountClassName(value: number): string {
  if (value > 0) return "amount--positive";
  if (value < 0) return "amount--negative";
  return "";
}
