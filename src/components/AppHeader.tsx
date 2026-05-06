type AppHeaderProps = {
  onToggleImport: () => void;
};

export function AppHeader({ onToggleImport }: AppHeaderProps) {
  return (
    <header className="app-header">
      <h2 className="app-header__title">Budji</h2>
      <button type="button" className="app-header__import-toggle" onClick={onToggleImport}>
        Import
      </button>
    </header>
  );
}
