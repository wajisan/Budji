import { useEffect, useState } from "react";
import {
  amountClassName,
  appendBillForSide,
  filterBillsBySide,
  mapBillAtFilteredIndex,
  removeBillAtFilteredIndex,
} from "../lib/budget";
import type { BudgetTable, LedgerSide } from "../types";
import { TrashIcon } from "./TrashIcon";

type EditModalProps = {
  open: boolean;
  side: LedgerSide | null;
  table: BudgetTable | null;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (next: BudgetTable) => void;
  onDeleteTable: () => void;
};

export function EditModal({ open, side, table, onClose, onSave, onUpdate, onDeleteTable }: EditModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (open) {
      setNewLabel("");
      setNewValue("");
    }
  }, [open, side]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !table || side === null) return null;

  const filteredBills = filterBillsBySide(table.bills, side);
  const sectionTitle = side === "income" ? "Revenus" : "Dépenses";

  const updateName = (name: string) => {
    onUpdate({ ...table, name });
  };

  const updateBill = (fi: number, partial: { label?: string; value?: number | string }) => {
    const nextBills = mapBillAtFilteredIndex(table.bills, side, fi, (b) => {
      const label = partial.label !== undefined ? partial.label : b.label;
      if (partial.value === undefined) {
        return { ...b, label };
      }
      const n = Number(partial.value);
      if (side === "income") {
        const abs = Math.abs(Number.isFinite(n) ? n : 0);
        return abs === 0
          ? { label, value: 0, kind: "income" as const }
          : { label, value: abs };
      }
      const abs = Math.abs(Number.isFinite(n) ? n : 0);
      return abs === 0
        ? { label, value: 0, kind: "expense" as const }
        : { label, value: -abs };
    });
    onUpdate({ ...table, bills: nextBills });
  };

  const removeBill = (fi: number) => {
    onUpdate({
      ...table,
      bills: removeBillAtFilteredIndex(table.bills, side, fi),
    });
  };

  const addBill = () => {
    onUpdate(appendBillForSide(table, side, newLabel, newValue));
    setNewLabel("");
    setNewValue("");
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="modal-mask modal-animate-overlay" role="presentation" onClick={handleBackdropClick}>
      <div
        className="modal-dialog modal-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-carnet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content modal-animate-panel">
          <div className="modal-header">
            <input
              id="modal-carnet-title"
              className="modal-header__title-input input-minimal"
              placeholder="Titre du carnet"
              value={table.name}
              onChange={(e) => updateName(e.target.value)}
              aria-label="Titre du carnet"
            />
            <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer sans enregistrer">
              ×
            </button>
          </div>
          <div className="modal-body">
            <h5 className="modal-section-label">{sectionTitle}</h5>
            <div className="modal-add-row">
              <input
                className="input-minimal"
                placeholder="Libellé"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
              <input
                className="input-minimal"
                placeholder={side === "income" ? "Montant" : "Montant (positif)"}
                type="number"
                inputMode="decimal"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button type="button" className="btn btn--secondary" onClick={addBill}>
                +
              </button>
            </div>
            <ul className="bill-list bill-list--modal">
              {filteredBills.map((bill, fi) => (
                <li key={`${side}-line-${fi}`} className={`bill-list__item ${amountClassName(side === "expense" ? -Math.abs(bill.value) : bill.value)}`}>
                  <div className="modal-row--bill">
                    <input
                      className="input-minimal"
                      placeholder="Libellé"
                      value={bill.label}
                      onChange={(e) => updateBill(fi, { label: e.target.value })}
                    />
                    <input
                      className="input-minimal"
                      placeholder={side === "income" ? "Montant" : "Montant"}
                      type="number"
                      inputMode="decimal"
                      value={side === "expense" ? (Number.isNaN(bill.value) ? "" : Math.abs(bill.value)) : Number.isNaN(bill.value) ? "" : bill.value}
                      onChange={(e) => updateBill(fi, { value: e.target.value })}
                    />
                    <button type="button" className="btn-remove-line" onClick={() => removeBill(fi)} aria-label="Supprimer cette ligne">
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--danger btn--lg" onClick={onDeleteTable}>
              Supprimer
            </button>
            <button type="button" className="btn btn--success btn--lg modal-footer__save" onClick={onSave}>
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
