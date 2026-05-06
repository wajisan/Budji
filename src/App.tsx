import { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { AppHeader } from "./components/AppHeader";
import { BudgetCard } from "./components/BudgetCard";
import { EditModal } from "./components/EditModal";
import { HeroSection } from "./components/HeroSection";
import { ImportPanel } from "./components/ImportPanel";
import {
  cloneBudgetTable,
  createEmptyNotebook,
  defaultTables,
  importTablesJsonString,
  loadTables,
  sanitizeTableForSave,
  saveTables,
} from "./lib/budget";
import type { BudgetTable, LedgerSide } from "./types";

const CARD_TRANSITION_MS = 260;

export default function App() {
  const [tables, setTables] = useState<BudgetTable[]>(defaultTables);
  const [hydrated, setHydrated] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [draftTable, setDraftTable] = useState<BudgetTable | null>(null);
  const [modalSide, setModalSide] = useState<LedgerSide | null>(null);

  const tablesRef = useRef(tables);
  tablesRef.current = tables;

  useEffect(() => {
    setTables(loadTables());
    setHydrated(true);
  }, []);

  const handleToggleCounted = useCallback((notebookId: string) => {
    setTables((prev) => {
      const next = prev.map((t) =>
        t.id === notebookId ? { ...t, countMe: !t.countMe } : t
      );
      saveTables(next);
      return next;
    });
  }, []);

  const handleAddNotebook = useCallback(() => {
    setTables((prev) => {
      const next = [...prev, createEmptyNotebook()];
      saveTables(next);
      return next;
    });
  }, []);

  const handleImport = useCallback(() => {
    try {
      const next = importTablesJsonString(importValue.trim());
      saveTables(next);
      setTables(next);
      setShowImport(false);
      setImportValue("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import invalide";
      window.alert(msg);
    }
  }, [importValue]);

  const openEdit = useCallback((notebookId: string, side: LedgerSide) => {
    const t = tablesRef.current.find((x) => x.id === notebookId);
    if (t === undefined) return;
    setDraftTable(cloneBudgetTable(t));
    setEditingTableId(notebookId);
    setModalSide(side);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingTableId(null);
    setModalSide(null);
    setDraftTable(null);
  }, []);

  const saveModalAndClose = useCallback(() => {
    if (editingTableId === null || draftTable === null) return;
    const id = editingTableId;
    const saved = sanitizeTableForSave(draftTable);
    setTables((prev) => {
      const next = prev.map((t) => (t.id === id ? saved : t));
      saveTables(next);
      return next;
    });
    closeModal();
  }, [editingTableId, draftTable, closeModal]);

  const handleDraftUpdate = useCallback(
    (next: BudgetTable) => {
      if (editingTableId === null) return;
      if (next.id !== editingTableId) return;
      setDraftTable(next);
    },
    [editingTableId]
  );

  const handleDeleteTable = useCallback(() => {
    if (editingTableId === null) return;
    const id = editingTableId;
    setTables((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTables(next);
      return next;
    });
    closeModal();
  }, [editingTableId, closeModal]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="app-shell">
      <AppHeader onToggleImport={() => setShowImport((v) => !v)} />
      <ImportPanel
        visible={showImport}
        value={importValue}
        onChange={setImportValue}
        onImport={handleImport}
      />
      <HeroSection tables={tables} onAddNotebook={handleAddNotebook} />
      <div className="page-container">
        <TransitionGroup className="card-deck" component="div">
          {tables.map((table) => (
            <CSSTransition key={table.id} timeout={CARD_TRANSITION_MS} classNames="card-tx">
              <div className="card-tx-root">
                <BudgetCard
                  table={table}
                  onToggleCounted={handleToggleCounted}
                  onEdit={openEdit}
                />
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <EditModal
        open={showModal}
        side={modalSide}
        table={draftTable}
        onClose={closeModal}
        onSave={saveModalAndClose}
        onUpdate={handleDraftUpdate}
        onDeleteTable={handleDeleteTable}
      />
    </div>
  );
}
