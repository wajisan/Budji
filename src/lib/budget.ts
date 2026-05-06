import type { Bill, BudgetTable, LedgerSide } from "../types";
import { newNotebookId } from "./ids";

export const STORAGE_KEY = "tables";

/** Nom par défaut des carnets créés via « + » ; un carnet vide avec ce nom n’est pas écrit en stockage. */
export const DEFAULT_NEW_NOTEBOOK_NAME = "Nouveau Budget";

export type { LedgerSide };

/** Nouveau carnet vide (avec id unique). */
export function createEmptyNotebook(name = DEFAULT_NEW_NOTEBOOK_NAME): BudgetTable {
  return {
    id: newNotebookId(),
    name,
    bills: [],
    countMe: false,
  };
}

export function cloneBudgetTable(t: BudgetTable): BudgetTable {
  return JSON.parse(JSON.stringify(t)) as BudgetTable;
}

export function defaultTables(): BudgetTable[] {
  return [
    {
      id: "budji-seed-fixe",
      name: "Fixe",
      bills: [
        { label: "Salaire Net", value: 2085 },
        { label: "Abonnement Spotify", value: -9.99 },
      ],
      countMe: true,
    },
    {
      id: "budji-seed-variable",
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
  const value = Number.isFinite(n) ? n : 0;
  const bill: Bill = { label, value };
  if (
    value === 0 &&
    (o.kind === "expense" || o.kind === "income")
  ) {
    bill.kind = o.kind;
  }
  return bill;
}

function normalizeTable(raw: unknown): BudgetTable | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id.length > 0 ? o.id : newNotebookId();
  const name = typeof o.name === "string" ? o.name : "Budget";
  const billsRaw = Array.isArray(o.bills) ? o.bills : [];
  const bills = billsRaw.map(normalizeBill);
  const countMe = typeof o.countMe === "boolean" ? o.countMe : false;
  return { id, name, bills, countMe };
}

export function loadTables(): BudgetTable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTables();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultTables();

    let lackedIds = false;
    for (const item of parsed) {
      if (item && typeof item === "object" && !Object.prototype.hasOwnProperty.call(item, "id")) {
        lackedIds = true;
        break;
      }
    }

    const tables = parsed.map(normalizeTable).filter((t): t is BudgetTable => t !== null);
    if (tables.length === 0) return defaultTables();

    const persisted = filterTablesForPersistence(tables);
    if (persisted.length === 0) return defaultTables();

    if (lackedIds || persisted.length !== tables.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    }

    return persisted;
  } catch {
    return defaultTables();
  }
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

export function isIncomeBill(b: Bill): boolean {
  if (b.value > 0) return true;
  if (b.value < 0) return false;
  return b.kind !== "expense";
}

export function isExpenseBill(b: Bill): boolean {
  if (b.value < 0) return true;
  if (b.value > 0) return false;
  return b.kind === "expense";
}

export function billMatchesSide(b: Bill, side: LedgerSide): boolean {
  return side === "income" ? isIncomeBill(b) : isExpenseBill(b);
}

export function filterBillsBySide(bills: Bill[], side: LedgerSide): Bill[] {
  return bills.filter((b) => billMatchesSide(b, side));
}

export function sumIncome(bills: Bill[]): number {
  return Math.round(
    bills.filter(isIncomeBill).reduce((a, b) => a + b.value, 0) * 100
  ) / 100;
}

export function sumExpenseAbs(bills: Bill[]): number {
  return Math.round(
    bills.filter(isExpenseBill).reduce((a, b) => a + Math.abs(b.value), 0) * 100
  ) / 100;
}

function withClearedKindIfSigned(b: Bill): Bill {
  if (b.value !== 0) {
    const { kind: _k, ...rest } = b;
    return rest as Bill;
  }
  return b;
}

export function mapBillAtFilteredIndex(
  bills: Bill[],
  side: LedgerSide,
  filteredIndex: number,
  mapFn: (b: Bill) => Bill
): Bill[] {
  let k = 0;
  return bills.map((b) => {
    if (!billMatchesSide(b, side)) return b;
    if (k === filteredIndex) {
      k++;
      return withClearedKindIfSigned(mapFn(b));
    }
    k++;
    return b;
  });
}

export function removeBillAtFilteredIndex(
  bills: Bill[],
  side: LedgerSide,
  filteredIndex: number
): Bill[] {
  let k = 0;
  return bills.filter((b) => {
    if (!billMatchesSide(b, side)) return true;
    if (k === filteredIndex) {
      k++;
      return false;
    }
    k++;
    return true;
  });
}

export function appendBillForSide(
  table: BudgetTable,
  side: LedgerSide,
  label: string,
  rawDisplay: number | string
): BudgetTable {
  const n = Number(rawDisplay);
  const abs = Number.isFinite(n) ? Math.abs(n) : 0;
  let bill: Bill;
  if (side === "income") {
    bill =
      abs === 0
        ? { label, value: 0, kind: "income" }
        : { label, value: abs };
  } else {
    bill =
      abs === 0
        ? { label, value: 0, kind: "expense" }
        : { label, value: -abs };
  }
  return { ...table, bills: [...table.bills, bill] };
}

export function isBillEmpty(b: Bill): boolean {
  const labelEmpty = (b.label?.trim() ?? "") === "";
  const v = Number(b.value);
  const valueEmpty = !Number.isFinite(v) || v === 0;
  return labelEmpty && valueEmpty;
}

export function sanitizeBillsForSave(bills: Bill[]): Bill[] {
  if (bills.length === 0) return [];
  if (bills.length === 1 && isBillEmpty(bills[0])) {
    return [{ ...bills[0] }];
  }
  return bills.filter((b) => !isBillEmpty(b));
}

export function sanitizeTableForSave(table: BudgetTable): BudgetTable {
  return { ...table, bills: sanitizeBillsForSave(table.bills) };
}

/** Carnet sans lignes utiles après nettoyage, encore nommé comme à la création → ne pas persister. */
export function shouldPersistNotebook(table: BudgetTable): boolean {
  const sanitized = sanitizeTableForSave(table);
  if (sanitized.bills.length > 0) return true;
  return table.name.trim() !== DEFAULT_NEW_NOTEBOOK_NAME;
}

export function filterTablesForPersistence(tables: BudgetTable[]): BudgetTable[] {
  return tables.filter(shouldPersistNotebook);
}

export function saveTables(tables: BudgetTable[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filterTablesForPersistence(tables)));
}
