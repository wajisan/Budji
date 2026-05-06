import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { BudgetCard } from "./components/BudgetCard";
import { EditModal } from "./components/EditModal";
import { HeroSection } from "./components/HeroSection";
import { ImportPanel } from "./components/ImportPanel";
import { defaultTables, importTablesJsonString, loadTables, saveTables } from "./lib/budget";
import type { BudgetTable } from "./types";

export default function App() {
  const [tables, setTables] = useState<BudgetTable[]>(defaultTables);
  const [hydrated, setHydrated] = useState(false);
  const [needSave, setNeedSave] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  useEffect(() => {
    setTables(loadTables());
    setHydrated(true);
  }, []);

  const handleToggleCounted = useCallback((index: number) => {
    setTables((prev) =>
      prev.map((t, i) => (i === index ? { ...t, countMe: !t.countMe } : t))
    );
    setNeedSave(true);
  }, []);

  const handleAddNotebook = useCallback(() => {
    setTables((prev) => [
      ...prev,
      { name: "Nouveau Budget", bills: [], countMe: false },
    ]);
    setNeedSave(true);
  }, []);

  const handleSave = useCallback(() => {
    setTables((current) => {
      saveTables(current);
      return current;
    });
    setNeedSave(false);
  }, []);

  const handleImport = useCallback(() => {
    try {
      const next = importTablesJsonString(importValue.trim());
      saveTables(next);
      setTables(next);
      setShowImport(false);
      setImportValue("");
      setNeedSave(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import invalide";
      window.alert(msg);
    }
  }, [importValue]);

  const openEdit = useCallback((index: number) => {
    setModalIndex(index);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalIndex(null);
  }, []);

  const handleUpdateEditing = useCallback(
    (next: BudgetTable) => {
      if (modalIndex === null) return;
      setTables((prev) => prev.map((t, i) => (i === modalIndex ? next : t)));
      setNeedSave(true);
    },
    [modalIndex]
  );

  const handleDeleteTable = useCallback(() => {
    if (modalIndex === null) return;
    setTables((prev) => prev.filter((_, i) => i !== modalIndex));
    setNeedSave(true);
    closeModal();
  }, [modalIndex, closeModal]);

  const editingTable = modalIndex !== null ? tables[modalIndex] ?? null : null;

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <AppHeader onToggleImport={() => setShowImport((v) => !v)} />
      <ImportPanel
        visible={showImport}
        value={importValue}
        onChange={setImportValue}
        onImport={handleImport}
      />
      <HeroSection
        tables={tables}
        needSave={needSave}
        onAddNotebook={handleAddNotebook}
        onSave={handleSave}
      />
      <div className="page-container">
        <div className="card-deck">
          {tables.map((table, index) => (
            <BudgetCard
              key={`${table.name}-${index}`}
              table={table}
              index={index}
              onToggleCounted={handleToggleCounted}
              onEdit={openEdit}
            />
          ))}
        </div>
      </div>
      <EditModal
        open={showModal}
        table={editingTable}
        onClose={closeModal}
        onUpdate={handleUpdateEditing}
        onDeleteTable={handleDeleteTable}
      />
    </>
  );
}
