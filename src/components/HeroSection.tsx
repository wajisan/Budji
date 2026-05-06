import { amountClassName, grandTotal } from "../lib/budget";
import type { BudgetTable } from "../types";

type HeroSectionProps = {
  tables: BudgetTable[];
  onAddNotebook: () => void;
};

export function HeroSection({ tables, onAddNotebook }: HeroSectionProps) {
  const total = grandTotal(tables);
  return (
    <section className="hero">
      <h1 className="hero__title">Budji</h1>
      <p className="hero__lead">Conçu pour vous aider à gérer vos budgets, réels ou fictifs.</p>
      <div className="hero__total">
        <p className="hero__total-label">Total restant</p>
        <p className="hero__total-value">
          <span className={amountClassName(total)}>{total}</span>
          <span className="currency">€</span>
        </p>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--outline btn--lg" onClick={onAddNotebook}>
          Ajouter un carnet
        </button>
      </div>
    </section>
  );
}
