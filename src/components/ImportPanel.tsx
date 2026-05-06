type ImportPanelProps = {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onImport: () => void;
};

export function ImportPanel({ visible, value, onChange, onImport }: ImportPanelProps) {
  if (!visible) return null;
  return (
    <div className="import-panel">
      <input
        className="import-panel__input"
        placeholder="Insérer JSON ici"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="btn btn--secondary" onClick={onImport}>
        Import
      </button>
    </div>
  );
}
