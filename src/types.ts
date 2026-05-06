export type BillKind = "income" | "expense";

export type Bill = {
  label: string;
  value: number;
  /** Montant 0 uniquement : précise si la ligne est saisie côté dépense (sinon revenu). */
  kind?: BillKind;
};

export type BudgetTable = {
  /** Identifiant stable (animations, clés React, persistance). */
  id: string;
  name: string;
  bills: Bill[];
  countMe: boolean;
};

export type LedgerSide = "income" | "expense";
