import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BudgetTable } from "../types";

const MODAL_CLOSE_MS = 180;

type NotebookSettingsModalProps = {
  open: boolean;
  table: BudgetTable | null;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (next: BudgetTable) => void;
  onDeleteNotebook: () => void;
};

export function NotebookSettingsModal({
  open,
  table,
  onClose,
  onSave,
  onUpdate,
  onDeleteNotebook,
}: NotebookSettingsModalProps) {
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);

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

  if (!table) return null;
  if (!open && !closing) return null;

  const updateName = (name: string) => {
    onUpdate({ ...table, name });
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
        className="modal-dialog modal-dialog--notebook"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-content${closing ? "" : " modal-animate-panel"}`}>
          <div className="modal-header">
            <h2 id="notebook-settings-title" className="modal-title">
              Carnet
            </h2>
            <button type="button" className="modal-close" onClick={requestClose} aria-label="Fermer">
              ×
            </button>
          </div>
          <div className="modal-body modal-body--notebook-settings">
            <label className="modal-settings-label" htmlFor="notebook-settings-name-input">
              Titre
            </label>
            <input
              id="notebook-settings-name-input"
              className="modal-settings-title-input input-minimal"
              placeholder="Nom du carnet"
              value={table.name}
              onChange={(e) => updateName(e.target.value)}
              aria-label="Titre du carnet"
            />
          </div>
          <div className="modal-footer modal-footer--notebook-settings">
            <button type="button" className="btn btn--danger btn--lg" onClick={onDeleteNotebook}>
              Supprimer le carnet
            </button>
            <button type="button" className="btn btn--success btn--lg modal-footer__save" onClick={onSave}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
