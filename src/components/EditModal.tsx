import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  amountClassName,
  appendBillForSide,
  filterBillsBySide,
  mapBillAtFilteredIndex,
  removeBillAtFilteredIndex,
} from "../lib/budget";
import type { BudgetTable, LedgerSide } from "../types";
import { TrashIcon } from "./TrashIcon";

const MODAL_CLOSE_MS = 180;

type EditModalProps = {
  open: boolean;
  side: LedgerSide | null;
  table: BudgetTable | null;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (next: BudgetTable) => void;
};

export function EditModal({ open, side, table, onClose, onSave, onUpdate }: EditModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setNewLabel("");
      setNewValue("");
    }
  }, [open, side]);

  /** Réinitialise « closing » avant le premier paint lors d’une réouverture. */
  useLayoutEffect(() => {
    if (!open) return;
    closingRef.current = false;
    setClosing(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const requestClose = useCallback(() => {
    if (!open || closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      closingRef.current = false;
      onClose();
    }, MODAL_CLOSE_MS);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  if (!table || side === null) return null;
  if (!open && !closing) return null;

  const filteredBills = filterBillsBySide(table.bills, side);
  const sectionTitle = side === "income" ? "Revenus" : "Dépenses";

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
    requestClose();
  };

  return (
    <div
      className={`modal-mask ${closing ? "modal-mask--exit" : "modal-animate-overlay"}`}
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="modal-dialog modal-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-carnet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-content${closing ? "" : " modal-animate-panel"}`}>
          <div className="modal-header">
            <h2 id="modal-carnet-title" className="modal-title modal-title--modal-readonly" title={table.name || undefined}>
              {table.name || "Carnet"}
            </h2>
            <button type="button" className="modal-close" onClick={requestClose} aria-label="Fermer sans enregistrer">
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
              <button type="button" className="btn btn--secondary btn-modal-inline" onClick={addBill} aria-label="Ajouter la ligne">
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
          <div className="modal-footer modal-footer--single-save">
            <button type="button" className="btn btn--success btn--lg modal-footer__save" onClick={onSave}>
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
