import { amountClassName, grandTotal } from "../lib/budget";
import type { BudgetTable } from "../types";

type HeroSectionProps = {
  tables: BudgetTable[];
  needSave: boolean;
  onAddNotebook: () => void;
  onSave: () => void;
};

export function HeroSection({ tables, needSave, onAddNotebook, onSave }: HeroSectionProps) {
  const total = grandTotal(tables);
  return (
    <section className="hero">
      <h1 className="hero__title">Budji</h1>
      <p className="hero__lead">Conçu pour vous aider à gérer vos budgets, réels ou fictifs.</p>
      <div className="card card--total">
        <div className="card__header card__header--static">
          <h4 className="card__header-title">Total restant</h4>
        </div>
        <div className="card__body card__body--total">
          <span className={amountClassName(total)}>{total}</span>
          <span className="currency">€</span>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--outline btn--lg" onClick={onAddNotebook}>
          Ajouter un carnet
        </button>
        <button
          type="button"
          className={needSave ? "btn btn--lg btn--needs-save" : "btn btn--outline btn--lg"}
          onClick={onSave}
        >
          Sauvegarde{needSave ? " nécessaire" : ""}
        </button>
      </div>
    </section>
  );
}
