import type { KeyboardEvent, MouseEvent } from "react";
import { amountClassName, filterBillsBySide, totalBills } from "../lib/budget";
import type { BudgetTable, LedgerSide } from "../types";

type BudgetCardProps = {
  table: BudgetTable;
  onToggleCounted: (notebookId: string) => void;
  onEdit: (notebookId: string, side: LedgerSide) => void;
  onOpenNotebookSettings: (notebookId: string) => void;
};

export function BudgetCard({ table, onToggleCounted, onEdit, onOpenNotebookSettings }: BudgetCardProps) {
  const subtotal = totalBills(table.bills);
  const excluded = !table.countMe;
  const incomeBills = filterBillsBySide(table.bills, "income");
  const expenseBills = filterBillsBySide(table.bills, "expense");

  const openColumn = (side: LedgerSide, e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    onEdit(table.id, side);
  };

  return (
    <article className={`card${excluded ? " card--excluded" : ""}`}>
      <div
        className="card__header card__header--title-action"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onOpenNotebookSettings(table.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenNotebookSettings(table.id);
          }
        }}
        aria-label={`Modifier le carnet ${table.name || "sans titre"}`}
      >
        <h4 className="card__header-title" title={table.name || undefined}>
          {table.name}
        </h4>
      </div>
      <div className="card__body card__body--split">
        <div
          className="card__column card__column--income"
          role="button"
          tabIndex={0}
          onClick={(e) => openColumn("income", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openColumn("income", e);
            }
          }}
          aria-label={`Revenus du carnet ${table.name}, modifier`}
        >
          <div className="card__column-head">Revenus</div>
          <ul className="bill-list card__bill-list">
            {incomeBills.map((bill, i) => (
              <li key={`in-${table.id}-${i}`} className={`bill-list__item ${amountClassName(bill.value)}`}>
                <label>{bill.label}</label>
                <span className="bill-list__amount">{bill.value}€</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card__column-gap" aria-hidden />
        <div
          className="card__column card__column--expense"
          role="button"
          tabIndex={0}
          onClick={(e) => openColumn("expense", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openColumn("expense", e);
            }
          }}
          aria-label={`Dépenses du carnet ${table.name}, modifier`}
        >
          <div className="card__column-head">Dépenses</div>
          <ul className="bill-list card__bill-list">
            {expenseBills.map((bill, i) => (
              <li key={`ex-${table.id}-${i}`} className="bill-list__item bill-list__item--expense-row amount--negative">
                <label title={bill.label || undefined}>{bill.label}</label>
                <span className="bill-list__amount">{Math.abs(bill.value)}€</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="card__footer-total card__footer-total--toggle"
        role="button"
        tabIndex={0}
        onClick={() => onToggleCounted(table.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleCounted(table.id);
          }
        }}
        aria-pressed={table.countMe}
        aria-label={
          table.countMe
            ? `Solde du carnet ${table.name}, inclus dans le total. Activer pour exclure ce carnet.`
            : `Solde du carnet ${table.name}, exclu du total. Activer pour inclure ce carnet.`
        }
      >
        <span className="card__footer-total-label">solde</span>
        <span className={`card__footer-total-value ${amountClassName(subtotal)}`}>{subtotal}</span>
        <span className="currency">€</span>
      </div>
    </article>
  );
}
