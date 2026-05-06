import { useEffect, useState } from "react";
import { amountClassName } from "../lib/budget";
import type { BudgetTable } from "../types";

type EditModalProps = {
  open: boolean;
  table: BudgetTable | null;
  onClose: () => void;
  onUpdate: (next: BudgetTable) => void;
  onDeleteTable: () => void;
};

export function EditModal({ open, table, onClose, onUpdate, onDeleteTable }: EditModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (open) {
      setNewLabel("");
      setNewValue("");
    }
  }, [open, table]);

  if (!open || !table) return null;

  const updateName = (name: string) => {
    onUpdate({ ...table, name });
  };

  const updateBill = (billIndex: number, partial: { label?: string; value?: number }) => {
    onUpdate({
      ...table,
      bills: table.bills.map((b, i) => (i === billIndex ? { ...b, ...partial } : b)),
    });
  };

  const removeBill = (billIndex: number) => {
    onUpdate({
      ...table,
      bills: table.bills.filter((_, i) => i !== billIndex),
    });
  };

  const addBill = () => {
    onUpdate({
      ...table,
      bills: [...table.bills, { label: newLabel, value: Number(newValue) || 0 }],
    });
    setNewLabel("");
    setNewValue("");
  };

  return (
    <div className="modal-mask modal-enter" role="presentation">
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title" id="modal-title">
              Modifier
            </h4>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
              ×
            </button>
          </div>
          <div className="modal-body">
            <h5>Titre</h5>
            <input
              className="import-panel__input"
              style={{ width: "100%" }}
              placeholder="Titre"
              value={table.name}
              onChange={(e) => updateName(e.target.value)}
            />
            <ul className="bill-list">
              {table.bills.map((bill, key) => (
                <li key={key} className={`bill-list__item ${amountClassName(bill.value)}`}>
                  <div className="modal-row" style={{ width: "100%" }}>
                    <input
                      placeholder="nom"
                      value={bill.label}
                      onChange={(e) => updateBill(key, { label: e.target.value })}
                    />
                    <input
                      placeholder="valeur"
                      type="number"
                      inputMode="decimal"
                      value={Number.isNaN(bill.value) ? "" : bill.value}
                      onChange={(e) => updateBill(key, { value: Number(e.target.value) || 0 })}
                    />
                    <button type="button" className="btn btn--secondary" onClick={() => removeBill(key)}>
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <h5>Ajouter une valeur</h5>
            <div className="modal-row">
              <input placeholder="nom" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              <input
                placeholder="valeur"
                type="number"
                inputMode="decimal"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button type="button" className="btn btn--secondary" onClick={addBill}>
                +
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--danger" onClick={onDeleteTable}>
              Supprimer
            </button>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
