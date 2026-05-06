import { amountClassName, totalBills } from "../lib/budget";
import type { BudgetTable } from "../types";

type BudgetCardProps = {
  table: BudgetTable;
  index: number;
  onToggleCounted: (index: number) => void;
  onEdit: (index: number) => void;
};

export function BudgetCard({ table, index, onToggleCounted, onEdit }: BudgetCardProps) {
  const subtotal = totalBills(table.bills);
  return (
    <article className="card">
      <div
        className={
          table.countMe
            ? "card__header"
            : "card__header card__header--inactive"
        }
        onClick={() => onToggleCounted(index)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleCounted(index);
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={table.countMe}
        aria-label={
          table.countMe
            ? `Carnet ${table.name}, inclus dans le total. Cliquer pour exclure.`
            : `Carnet ${table.name}, exclu du total. Cliquer pour inclure.`
        }
      >
        <h4 className="card__header-title">{table.name}</h4>
      </div>
      <div className="card__body">
        {!table.countMe && <p className="hint">Ce budget n'est pas compté</p>}
        <h2 className="pricing-title">
          <span className={amountClassName(subtotal)}>{subtotal}</span>
          <span className="currency">€</span>
        </h2>
        <ul className="bill-list">
          {table.bills.map((bill, billIndex) => (
            <li key={`${index}-bill-${billIndex}`} className={`bill-list__item ${amountClassName(bill.value)}`}>
              <label>{bill.label}</label>
              {bill.value}€
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--outline btn--lg" onClick={() => onEdit(index)}>
          Modifier
        </button>
      </div>
    </article>
  );
}
